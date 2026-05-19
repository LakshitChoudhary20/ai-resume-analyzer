export default function SkillsPanel({ skills, missingSkills, jdSkills }) {
  return (
    <div className="space-y-5">
      {/* Detected skills */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span className="text-green-500">✅</span> Detected Skills ({skills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? skills.map(skill => (
            <span key={skill} className="badge bg-green-100 text-green-800">
              {skill}
            </span>
          )) : (
            <p className="text-sm text-gray-500">No skills detected. Make sure your resume mentions technologies clearly.</p>
          )}
        </div>
      </div>

      {/* Missing skills (only shown if JD was provided) */}
      {jdSkills && jdSkills.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="text-red-500">❌</span> Missing from JD ({missingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length > 0 ? missingSkills.map(skill => (
              <span key={skill} className="badge bg-red-100 text-red-800">
                {skill}
              </span>
            )) : (
              <span className="text-sm text-green-600 font-medium">🎉 You have all skills from the job description!</span>
            )}
          </div>
        </div>
      )}

      {/* JD skills matched */}
      {jdSkills && jdSkills.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>📋</span> All JD Skills ({jdSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {jdSkills.map(skill => {
              const matched = skills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`badge ${matched ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-600'}`}
                  title={matched ? 'You have this' : 'Missing from your resume'}
                >
                  {matched ? '✓ ' : ''}{skill}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
