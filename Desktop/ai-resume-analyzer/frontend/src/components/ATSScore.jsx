import { RadialBarChart, RadialBar, Cell, ResponsiveContainer } from 'recharts';

const ratingColor = {
  Excellent: 'text-green-600',
  Good: 'text-sky-600',
  Fair: 'text-amber-600',
  'Needs Work': 'text-red-600',
};

const ratingBg = {
  Excellent: 'bg-green-50 border-green-200',
  Good: 'bg-sky-50 border-sky-200',
  Fair: 'bg-amber-50 border-amber-200',
  'Needs Work': 'bg-red-50 border-red-200',
};

const gaugeColor = {
  Excellent: '#16a34a',
  Good: '#0284c7',
  Fair: '#d97706',
  'Needs Work': '#dc2626',
};

export default function ATSScore({ atsScore, rating, breakdown, matchPercentage, hasJobDescription }) {
  const color = gaugeColor[rating] || '#0284c7';
  const data = [{ value: atsScore, fill: color }];

  return (
    <div className="space-y-6">
      {/* Score gauge */}
      <div className="flex items-center gap-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={[{ value: 100, fill: '#e5e7eb' }, { value: atsScore, fill: color }]}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar dataKey="value" cornerRadius={6} background={false} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{atsScore}</span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>

        <div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${ratingBg[rating]}`}>
            <span className={ratingColor[rating]}>{rating}</span>
          </div>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            {rating === 'Excellent' && 'Great! Your resume is well-optimized for ATS systems.'}
            {rating === 'Good' && 'Your resume is solid. A few tweaks will push it higher.'}
            {rating === 'Fair' && 'Your resume needs some work to pass ATS filters.'}
            {rating === 'Needs Work' && 'Significant improvements needed to get past ATS screening.'}
          </p>

          {hasJobDescription && matchPercentage !== null && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">JD Match:</span>
              <span className={`font-bold text-lg ${matchPercentage >= 70 ? 'text-green-600' : matchPercentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {matchPercentage}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      {breakdown && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 text-sm">Score Breakdown</h4>
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-medium">{val.score} / {val.max}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(val.score / val.max) * 100}%`,
                    backgroundColor: (val.score / val.max) >= 0.7 ? '#16a34a' : (val.score / val.max) >= 0.4 ? '#d97706' : '#dc2626',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
