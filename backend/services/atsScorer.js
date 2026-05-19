const ATS_SECTIONS = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'certifications', 'achievements'];
const ACTION_VERBS = ['developed', 'built', 'led', 'managed', 'designed', 'implemented', 'improved',
  'increased', 'reduced', 'created', 'deployed', 'optimized', 'architected', 'launched', 'delivered',
  'spearheaded', 'streamlined', 'collaborated', 'negotiated', 'mentored', 'automated', 'migrated'];

const QUANTIFIED_IMPACT = /\b(increased?|decreased?|reduced?|improved?|grew?|generated?|saved?|cut|boosted?)\b.{0,40}\b(\d+\s*(%|percent|x|times|\$|k\b|million))/gi;

const calculateATSScore = (resumeText, skills, jdSkills = []) => {
  const lower = resumeText.toLowerCase();
  let score = 0;
  const breakdown = {};

  // 1. Contact info (15 pts)
  const hasEmail    = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/.test(resumeText);
  const hasPhone    = /(\+?[\d\s\-().]{10,15})/.test(resumeText);
  const hasLinkedIn = lower.includes('linkedin');
  const hasGitHub   = lower.includes('github') || lower.includes('portfolio');
  const contactScore = (hasEmail ? 5 : 0) + (hasPhone ? 4 : 0) + (hasLinkedIn ? 3 : 0) + (hasGitHub ? 3 : 0);
  breakdown.contact = { score: contactScore, max: 15, details: { hasEmail, hasPhone, hasLinkedIn, hasGitHub } };
  score += contactScore;

  // 2. Sections (15 pts)
  const foundSections = ATS_SECTIONS.filter(s => lower.includes(s));
  const hasCritical = ['experience', 'education', 'skills'].filter(s => lower.includes(s)).length;
  const sectionScore = foundSections.length >= 5 ? 15
    : foundSections.length === 4 ? 12
    : foundSections.length === 3 ? (hasCritical === 3 ? 9 : 6)
    : foundSections.length === 2 ? 5
    : 2;
  breakdown.sections = { score: sectionScore, max: 15, found: foundSections };
  score += sectionScore;

  // 3. Skills (25 pts)
  let skillScore;
  if (jdSkills.length > 0) {
    const matched = skills.filter(s => jdSkills.map(j => j.toLowerCase()).includes(s.toLowerCase())).length;
    const matchRatio = matched / Math.max(jdSkills.length, 1);
    skillScore = Math.round(matchRatio * 25);
    if (matchRatio < 0.4) skillScore = Math.min(skillScore, 10);
  } else {
    skillScore = skills.length >= 15 ? 20
      : skills.length >= 10 ? 16
      : skills.length >= 6  ? 12
      : skills.length >= 3  ? 7
      : 3;
  }
  breakdown.skills = { score: skillScore, max: 25, count: skills.length };
  score += skillScore;

  // 4. Action verbs (15 pts)
  const foundVerbs = ACTION_VERBS.filter(v => lower.includes(v));
  const verbScore = foundVerbs.length >= 8 ? 15
    : foundVerbs.length >= 5 ? 11
    : foundVerbs.length >= 3 ? 7
    : foundVerbs.length >= 1 ? 3
    : 0;
  breakdown.actionVerbs = { score: verbScore, max: 15, found: foundVerbs };
  score += verbScore;

  // 5. Quantified achievements (15 pts)
  const quantifiedMatches = (resumeText.match(QUANTIFIED_IMPACT) || []).length;
  const quantScore = quantifiedMatches >= 5 ? 15
    : quantifiedMatches >= 3 ? 11
    : quantifiedMatches >= 1 ? 6
    : 0;
  breakdown.quantifiedImpact = { score: quantScore, max: 15, count: quantifiedMatches };
  score += quantScore;

  // 6. Length (10 pts)
  const wordCount = resumeText.split(/\s+/).length;
  const lengthScore = wordCount >= 400 && wordCount <= 900 ? 10
    : wordCount >= 250 ? 7
    : wordCount > 900  ? 6
    : 3;
  breakdown.length = { score: lengthScore, max: 10, wordCount };
  score += lengthScore;

  // 7. Deductions
  const hasObjectiveOnly  = lower.includes('objective') && !lower.includes('summary');
  const hasParagraphBlobs = (resumeText.match(/[A-Z][^.!?]*[.!?]/g) || []).filter(s => s.split(' ').length > 40).length > 3;
  const deductions = (hasObjectiveOnly ? 3 : 0) + (hasParagraphBlobs ? 4 : 0);
  breakdown.deductions = { score: -deductions, max: 0, hasObjectiveOnly, hasParagraphBlobs };
  score -= deductions;

  const total = Math.max(10, Math.min(100, score));

  return {
    total,
    breakdown,
    rating: total >= 88 ? 'Exceptional'
      : total >= 75 ? 'Strong'
      : total >= 60 ? 'Good'
      : total >= 45 ? 'Fair'
      : 'Needs Work',
  };
};

module.exports = { calculateATSScore };
