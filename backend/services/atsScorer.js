/**
 * Calculates an ATS compatibility score for the resume.
 * Checks for: contact info, sections, keyword density, formatting signals.
 */

const ATS_SECTIONS = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'certifications'];
const ACTION_VERBS = ['developed', 'built', 'led', 'managed', 'designed', 'implemented', 'improved',
  'increased', 'reduced', 'created', 'deployed', 'optimized', 'architected', 'launched', 'delivered'];

const calculateATSScore = (resumeText, skills, jdSkills = []) => {
  const lower = resumeText.toLowerCase();
  let score = 0;
  const breakdown = {};

  // 1. Contact info check (20 pts)
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/.test(resumeText);
  const hasPhone = /(\+?[\d\s\-().]{10,15})/.test(resumeText);
  const hasLinkedIn = lower.includes('linkedin');
  const contactScore = (hasEmail ? 8 : 0) + (hasPhone ? 8 : 0) + (hasLinkedIn ? 4 : 0);
  breakdown.contact = { score: contactScore, max: 20, details: { hasEmail, hasPhone, hasLinkedIn } };
  score += contactScore;

  // 2. Sections present (20 pts)
  const foundSections = ATS_SECTIONS.filter(s => lower.includes(s));
  const sectionScore = Math.min(20, foundSections.length * 4);
  breakdown.sections = { score: sectionScore, max: 20, found: foundSections };
  score += sectionScore;

  // 3. Skills (30 pts)
  const skillScore = jdSkills.length > 0
    ? Math.round((skills.filter(s => jdSkills.includes(s)).length / Math.max(jdSkills.length, 1)) * 30)
    : Math.min(30, skills.length * 2);
  breakdown.skills = { score: skillScore, max: 30, count: skills.length };
  score += skillScore;

  // 4. Action verbs (15 pts)
  const foundVerbs = ACTION_VERBS.filter(v => lower.includes(v));
  const verbScore = Math.min(15, foundVerbs.length * 3);
  breakdown.actionVerbs = { score: verbScore, max: 15, found: foundVerbs };
  score += verbScore;

  // 5. Length / density check (15 pts)
  const wordCount = resumeText.split(/\s+/).length;
  const lengthScore = wordCount >= 300 && wordCount <= 1000 ? 15 : wordCount >= 150 ? 8 : 3;
  breakdown.length = { score: lengthScore, max: 15, wordCount };
  score += lengthScore;

  return {
    total: Math.min(100, score),
    breakdown,
    rating: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work',
  };
};

module.exports = { calculateATSScore };
