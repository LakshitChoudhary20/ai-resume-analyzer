const Groq = require('groq-sdk');

let groq;

const getClient = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set in .env file');
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

const ask = async (prompt) => {
  const response = await getClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });
  return response.choices[0].message.content.trim();
};

const getResumeSuggestions = async (resumeText, skills, missingSkills) => {
  const prompt = `You are an expert resume coach and ATS specialist.
Analyze this resume and provide actionable improvement suggestions.

RESUME TEXT:
${resumeText.substring(0, 3000)}

DETECTED SKILLS: ${skills.join(', ')}
MISSING SKILLS (from job market demand): ${missingSkills.slice(0, 10).join(', ')}

Provide exactly 5 specific, actionable suggestions to improve this resume.
Format your response as a JSON array like:
[
  { "category": "Impact", "suggestion": "...", "example": "..." }
]
Return ONLY the JSON array, no other text.`;

  const text = await ask(prompt);
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return [{ category: 'General', suggestion: text, example: '' }];
  }
};

const getInterviewQuestions = async (resumeText, skills) => {
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

  const text = await ask(prompt);
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return [{ type: 'General', question: text, hint: '' }];
  }
};

const generateResumeSummary = async (resumeText, skills) => {
  const prompt = `Write a compelling 3-sentence professional summary for this resume.
Make it ATS-friendly, achievement-focused, and include key skills.

RESUME:
${resumeText.substring(0, 2000)}
SKILLS: ${skills.join(', ')}

Return ONLY the summary paragraph, no labels or extra text.`;

  return await ask(prompt);
};

module.exports = { getResumeSuggestions, getInterviewQuestions, generateResumeSummary };
