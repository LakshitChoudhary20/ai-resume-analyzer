const fs = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../services/pdfParser');
const { extractSkills, extractSkillsFromJD, findMissingSkills } = require('../services/skillExtractor');
const { calculateATSScore } = require('../services/atsScorer');
const { getResumeSuggestions, getInterviewQuestions, generateResumeSummary } = require('../services/gemini.service');
const Resume = require('../models/Resume');

/**
 * POST /api/resume/analyze
 * Upload PDF + optional job description → returns full analysis
 */
const analyzeResume = async (req, res) => {
  let filePath;
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded.' });

    filePath = req.file.path;
    const jobDescription = req.body.jobDescription || '';

    // 1. Extract text from PDF
    const resumeText = await extractTextFromPDF(filePath);
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract text from PDF. Make sure it is not a scanned image.' });
    }

    // 2. Extract skills
    const skills = extractSkills(resumeText);
    const jdSkills = jobDescription ? extractSkillsFromJD(jobDescription) : [];
    const missingSkills = findMissingSkills(skills, jdSkills);

    // 3. ATS Score
    const atsResult = calculateATSScore(resumeText, skills, jdSkills);

    // 4. Job description match percentage
    const matchPercentage = jdSkills.length > 0
      ? Math.round(((jdSkills.length - missingSkills.length) / jdSkills.length) * 100)
      : null;

    // 5. AI suggestions (only if Gemini key is set)
    let suggestions = [];
    let interviewQuestions = [];
    let aiSummary = '';

    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
      try {
        [suggestions, interviewQuestions, aiSummary] = await Promise.all([
          getResumeSuggestions(resumeText, skills, missingSkills),
          getInterviewQuestions(resumeText, skills),
          generateResumeSummary(resumeText, skills),
        ]);
      } catch (aiErr) {
        console.error('Gemini AI error:', aiErr.message);
        // Continue without AI features — don't crash the whole response
      }
    }

    // 6. Save analysis
    const resume = Resume.create({
      userId: req.user?.id || 'guest',
      filename: req.file.originalname,
      atsScore: atsResult.total,
      skills,
      missingSkills,
      matchPercentage,
      suggestions,
      interviewQuestions,
      aiSummary,
      breakdown: atsResult.breakdown,
    });

    // Clean up uploaded file
    fs.unlink(filePath, () => {});

    res.json({
      success: true,
      analysis: {
        id: resume.id,
        filename: resume.filename,
        atsScore: atsResult.total,
        rating: atsResult.rating,
        breakdown: atsResult.breakdown,
        skills,
        missingSkills,
        matchPercentage,
        suggestions,
        interviewQuestions,
        aiSummary,
        jdSkills,
        hasJobDescription: !!jobDescription,
        hasAI: suggestions.length > 0,
      },
    });
  } catch (err) {
    if (filePath) fs.unlink(filePath, () => {});
    console.error('analyzeResume error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/resume/history
 * Returns analysis history for the current user
 */
const getHistory = (req, res) => {
  const resumes = Resume.findByUser(req.user.id);
  res.json({ resumes });
};

module.exports = { analyzeResume, getHistory };
