import { useState } from 'react';

const typeColor = {
  Technical: 'bg-purple-100 text-purple-800',
  Behavioral: 'bg-blue-100 text-blue-800',
  General: 'bg-gray-100 text-gray-700',
};

export default function InterviewQuestions({ questions }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('All');

  if (!questions || questions.length === 0) return null;

  const types = ['All', ...new Set(questions.map(q => q.type))];
  const filtered = filter === 'All' ? questions : questions.filter(q => q.type === filter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-sm px-3 py-1 rounded-full font-medium transition-colors ${
              filter === t ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-sky-300 transition-colors"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="flex items-start gap-3 p-4">
              <span className="text-gray-400 font-mono text-sm mt-0.5 flex-shrink-0">Q{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-800 text-sm">{q.question}</p>
                  <span className={`badge flex-shrink-0 ${typeColor[q.type] || typeColor.General}`}>
                    {q.type}
                  </span>
                </div>
                {expanded === i && q.hint && (
                  <div className="mt-3 p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <p className="text-xs font-semibold text-sky-700 mb-1">💡 Answering tip</p>
                    <p className="text-sm text-sky-800">{q.hint}</p>
                  </div>
                )}
              </div>
              <span className="text-gray-400 text-xs flex-shrink-0">{expanded === i ? '▲' : '▼'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
