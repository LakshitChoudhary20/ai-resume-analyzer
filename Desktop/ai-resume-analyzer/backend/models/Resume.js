// In-memory resume store — holds analysis results per user session.

const resumes = [];

const Resume = {
  create: (data) => {
    const resume = { id: Date.now().toString(), ...data, createdAt: new Date() };
    resumes.push(resume);
    return resume;
  },
  findByUser: (userId) => resumes.filter(r => r.userId === userId),
  findById: (id) => resumes.find(r => r.id === id),
};

module.exports = Resume;
