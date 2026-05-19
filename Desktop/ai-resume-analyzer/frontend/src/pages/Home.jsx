import { useState } from 'react';
import api from '../services/api';
import ResumeUploader from '../components/ResumeUploader';
import ATSScore from '../components/ATSScore';
import SkillsPanel from '../components/SkillsPanel';
import InterviewQuestions from '../components/InterviewQuestions';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('score');

  const handleAnalyze = async (file, jobDescription) => {
    setLoading(true);
    setError('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription) formData.append('jobDescription', jobDescription);

    try {
      const res = await api.post('/api/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(res.data.analysis);
      setActiveTab('score');
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'score', label: '📊 ATS Score' },
    { id: 'skills', label: '🛠 Skills' },
    ...(analysis?.suggestions?.length ? [{ id: 'suggestions', label: '💡 AI Suggestions' }] : []),
    ...(analysis?.interviewQuestions?.length ? [{ id: 'interview', label: '🎤 Interview' }] : []),
    ...(analysis?.aiSummary ? [{ id: 'summary', label: '📝 AI Summary' }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 py-6">
        <h1 className="text-4xl font-bold text-gray-900">AI Resume Analyzer</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Upload your PDF resume to get an ATS score, skill gap analysis, and AI-generated interview questions.
        </p>
      </div>

      {/* Upload card */}
      <div className="card max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Your Resume</h2>
        <ResumeUploader onAnalyze={handleAnalyze} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Analysis: <span className="text-gray-500 font-normal text-base">{analysis.filename}</span>
            </h2>
            {!analysis.hasAI && (
              <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-full">
                ⚡ Add GEMINI_API_KEY for AI suggestions
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="card">
            {activeTab === 'score' && (
              <ATSScore
                atsScore={analysis.atsScore}
                rating={analysis.rating}
                breakdown={analysis.breakdown}
                matchPercentage={analysis.matchPercentage}
                hasJobDescription={analysis.hasJobDescription}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsPanel
                skills={analysis.skills}
                missingSkills={analysis.missingSkills}
                jdSkills={analysis.jdSkills}
              />
            )}

            {activeTab === 'suggestions' && analysis.suggestions && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">AI-Powered Suggestions</h3>
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4 hover:border-sky-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                        {s.category}
                      </span>
                      <div>
                        <p className="text-gray-800 text-sm">{s.suggestion}</p>
                        {s.example && (
                          <p className="text-gray-500 text-xs mt-1 italic">Example: {s.example}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'interview' && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Interview Questions — click to reveal tips</h3>
                <InterviewQuestions questions={analysis.interviewQuestions} />
              </div>
            )}

            {activeTab === 'summary' && analysis.aiSummary && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">AI-Generated Professional Summary</h3>
                <div className="bg-sky-50 border border-sky-100 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed">{analysis.aiSummary}</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Copy this summary to your resume's header section.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
