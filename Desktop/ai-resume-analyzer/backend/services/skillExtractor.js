// Comprehensive skill keyword list for tech resumes
const TECH_SKILLS = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin',
  'php', 'ruby', 'scala', 'r', 'matlab', 'bash', 'shell',
  // Frontend
  'react', 'vue', 'angular', 'next.js', 'nuxt', 'svelte', 'html', 'css', 'sass', 'tailwind',
  'bootstrap', 'redux', 'zustand', 'webpack', 'vite',
  // Backend
  'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'laravel', 'rails', 'nestjs',
  'graphql', 'rest', 'grpc',
  // Databases
  'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'dynamodb', 'elasticsearch', 'cassandra',
  'firebase', 'supabase',
  // Cloud / DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
  'github actions', 'ci/cd', 'linux', 'nginx',
  // AI/ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas',
  'numpy', 'opencv', 'nlp', 'llm', 'langchain', 'openai', 'gemini',
  // Tools
  'git', 'jira', 'figma', 'postman', 'socket.io', 'jwt', 'oauth', 'graphql',
];

/**
 * Extracts skills found in resume text.
 * @param {string} text - Raw resume text
 * @returns {string[]} - List of matched skills
 */
const extractSkills = (text) => {
  const lowerText = text.toLowerCase();
  return TECH_SKILLS.filter(skill => lowerText.includes(skill));
};

/**
 * Extracts skills from a job description text.
 */
const extractSkillsFromJD = (text) => extractSkills(text);

/**
 * Finds skills in JD that are missing from resume.
 */
const findMissingSkills = (resumeSkills, jdSkills) => {
  const resumeSet = new Set(resumeSkills);
  return jdSkills.filter(skill => !resumeSet.has(skill));
};

module.exports = { extractSkills, extractSkillsFromJD, findMissingSkills, TECH_SKILLS };
