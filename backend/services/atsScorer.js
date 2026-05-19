/**
 * Realistic ATS scoring — calibrated to give 55–75 for average resumes,
 * 75–85 for good ones, and 85+ only for genuinely strong CVs.
 * Mirrors how tools like Jobscan and Resume Worded score.
 */

const ATS_SECTIONS = ['experience', 'education', 'skills', 'projects', 'summary', 'certifications', 'achievements'];
const REQUIRED_SECTIONS = ['experience', 'education', 'skills']; // must-haves

const ACTION_VERBS = [
  'developed', 'built', 'led', 'managed', 'designed', 'implemented', 'improved',
  'increased', 'reduced', 'created', 'deployed', 'optimized', 'architected', 'launched',
  'delivered', 'automated', 'migrated', 'refactored', 'integrated', 'scaled',
  'mentored', 'collaborated', 'spearheaded', 'established', 'streamlined',
];

// ATS red flags that real systems penalize
const RED_FLAGS = [
  { pattern: /\.(jpg|jpeg|png|gif)/i,          label: 'Contains image references' },
  { pattern: /header|footer/i,                  label: 'May have header/footer (ATS often skips these)' },
  { pattern: /\[.*?\]/,                         label: 'Unfilled template placeholders' },
  { pattern: /curriculum vitae/i,               label: 'Uses "CV" instead of "Resume" (US market)' },
];

// Quantified impact — numbers show measurable results
const IMPACT_PATTERNS = [
  /\d+\s*%/,           // percentages
  /\$\s*[\d,]+/,       // dollar amounts
  /\d+\s*(users|clients|customers|teams|engineers|employees)/i,
  /\d+x\s/,            // multipliers like 3x
  /reduced.*by\s+\d+/i,
  /increased.*by\s+\d+/i,
  /saved.*\d+/i,
];

const calculateATSScore = (resumeText, skills, jdSkills = []) => {
  const lower = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  let score = 0;
  const breakdown = {};

  // ── 1. Contact Info (15 pts max) ─────────────────────────────────────────
  const hasEmail    = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/.test(resumeText);
  const hasPhone    = /(\+?[\d][\d\s\-().]{8,14}\d)/.test(resumeText);
  const hasLinkedIn = lower.includes('linkedin');
  const hasGitHub   = lower.includes('github');
  const hasLocation = /(city|state|\b[A-Z]{2}\b|\bremote\b)/i.test(resumeText);

  const contactScore =
    (hasEmail    ? 5 : 0) +
    (hasPhone    ? 4 : 0) +
    (hasLinkedIn ? 3 : 0) +
    (hasGitHub   ? 2 : 0) +
    (hasLocation ? 1 : 0);

  breakdown.contact = {
    score: contactScore, max: 15,
    details: { hasEmail, hasPhone, hasLinkedIn, hasGitHub, hasLocation },
  };
  score += contactScore;

  // ── 2. Required Sections (20 pts max) ────────────────────────────────────
  const foundSections = ATS_SECTIONS.filter(s => lower.includes(s));
  const missingRequired = REQUIRED_SECTIONS.filter(s => !lower.includes(s));

  // Each optional section adds 2pts, each required section adds 5pts, capped at 20
  const sectionScore = Math.min(20,
    REQUIRED_SECTIONS.filter(s => lower.includes(s)).length * 5 +
    foundSections.filter(s => !REQUIRED_SECTIONS.includes(s)).length * 2
  );

  breakdown.sections = {
    score: sectionScore, max: 20,
    found: foundSections,
    missing: missingRequired,
  };
  score += sectionScore;

  // ── 3. Keyword / Skills Match (25 pts max) ───────────────────────────────
  let skillScore;

  if (jdSkills.length > 0) {
    // With JD: score based on match ratio — strict
    const matched = skills.filter(s => jdSkills.includes(s)).length;
    const ratio = matched / jdSkills.length;
    // Even 100% match only gives 25, and it's nonlinear — partial matches hurt
    skillScore = Math.round(ratio * ratio * 25); // square the ratio to penalize low matches harder
  } else {
    // Without JD: realistic curve — having many skills is expected, not impressive
    // 5 skills → 10pts, 10 skills → 16pts, 15+ skills → 20pts (never full 25 without JD)
    skillScore = skills.length === 0 ? 0
      : skills.length < 5  ? skills.length * 2
      : skills.length < 10 ? 10 + (skills.length - 5) * 1.2
      : Math.min(20, 16 + (skills.length - 10) * 0.4);
    skillScore = Math.round(skillScore);
  }

  breakdown.skills = { score: skillScore, max: 25, count: skills.length };
  score += skillScore;

  // ── 4. Action Verbs & Writing Quality (15 pts max) ───────────────────────
  const foundVerbs = ACTION_VERBS.filter(v => lower.includes(v));
  // Need at least 5 strong verbs for a decent score; diminishing returns after 10
  const verbScore = foundVerbs.length === 0 ? 0
    : foundVerbs.length < 3  ? foundVerbs.length * 2
    : foundVerbs.length < 7  ? 6 + (foundVerbs.length - 3) * 1.5
    : Math.min(15, 12 + (foundVerbs.length - 7) * 0.5);

  breakdown.actionVerbs = {
    score: Math.round(verbScore), max: 15,
    found: foundVerbs,
    missing: ACTION_VERBS.filter(v => !lower.includes(v)).slice(0, 5),
  };
  score += Math.round(verbScore);

  // ── 5. Quantified Impact (15 pts max) ────────────────────────────────────
  const impactMatches = IMPACT_PATTERNS.filter(p => p.test(resumeText));
  // Recruiters expect 3–5 quantified achievements minimum
  const impactScore = impactMatches.length === 0 ? 0
    : impactMatches.length === 1 ? 4
    : impactMatches.length === 2 ? 7
    : impactMatches.length === 3 ? 10
    : impactMatches.length === 4 ? 12
    : Math.min(15, 12 + impactMatches.length);

  breakdown.impact = {
    score: impactScore, max: 15,
    quantifiedAchievements: impactMatches.length,
    tip: impactMatches.length < 3 ? 'Add more numbers: percentages, team sizes, cost savings, user counts' : null,
  };
  score += impactScore;

  // ── 6. Length & Density (10 pts max) ─────────────────────────────────────
  // Sweet spot: 400–800 words for 1-page resume, 600–1200 for 2-page
  const lengthScore =
    wordCount < 150  ? 2 :
    wordCount < 300  ? 5 :
    wordCount < 400  ? 7 :
    wordCount <= 900 ? 10 :
    wordCount <= 1400 ? 7 :
    4; // too long — ATS may truncate

  breakdown.length = { score: lengthScore, max: 10, wordCount };
  score += lengthScore;

  // ── 7. Red Flag Penalties ────────────────────────────────────────────────
  const triggeredFlags = RED_FLAGS.filter(f => f.pattern.test(resumeText));
  const penalty = triggeredFlags.length * 3;
  score = Math.max(0, score - penalty);

  if (triggeredFlags.length > 0) {
    breakdown.redFlags = {
      score: -penalty, max: 0,
      flags: triggeredFlags.map(f => f.label),
    };
  }

  // ── Final cap & rating ───────────────────────────────────────────────────
  const total = Math.min(98, Math.max(10, Math.round(score)));

  return {
    total,
    breakdown,
    rating: total >= 82 ? 'Excellent' : total >= 68 ? 'Good' : total >= 50 ? 'Fair' : 'Needs Work',
  };
};

module.exports = { calculateATSScore };