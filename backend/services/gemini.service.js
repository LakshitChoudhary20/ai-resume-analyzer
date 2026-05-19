const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in .env file');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Generates AI-powered resume improvement suggestions.
 */
const getResumeSuggestions = async (resumeText, skills, missingSkills) => {
  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert resume coach and ATS specialist. 
Analyze this resume and provide actionable improvement suggestions.

RESUME TEXT:
${resumeText.substring(0, 3000)}

DETECTED SKILLS: ${skills.join(', ')}
MISSING SKILLS (from job market demand): ${missingSkills.slice(0, 10).join(', ')}

Provide exactly 5 specific, actionable suggestions to improve this resume.
Format your response as a JSON array like:
[
  { "category": "Impact", "suggestion": "...", "example": "..." },
  ...
]
Return ONLY the JSON array, no other text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [{ category: 'General', suggestion: text, example: '' }];
  }
};

/**
 * Generates role-specific interview questions.
 */
const getInterviewQuestions = async (resumeText, skills) => {
  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a senior technical interviewer. Based on this candidate's resume, generate realistic interview questions.

RESUME SUMMARY:
${resumeText.substring(0, 2000)}
SKILLS: ${skills.join(', ')}

Generate 10 interview questions — mix of technical and behavioral.
Return ONLY a JSON array like:
[
  { "type": "Technical", "question": "...", "hint": "What to focus on in your answer" },
  { "type": "Behavioral", "question": "...", "hint": "..." }
]
Return ONLY the JSON array, no other text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [{ type: 'General', question: text, hint: '' }];
  }
};

/**
 * Generates a professional resume summary.
 */
const generateResumeSummary = async (resumeText, skills) => {
  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Write a compelling 3-sentence professional summary for this resume.
Make it ATS-friendly, achievement-focused, and include key skills.

RESUME:
${resumeText.substring(0, 2000)}
SKILLS: ${skills.join(', ')}

Return ONLY the summary paragraph, no labels or extra text.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = { getResumeSuggestions, getInterviewQuestions, generateResumeSummary };
