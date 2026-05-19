import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/api/resume/history')
      .then(res => setHistory(res.data.resumes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Your resume analysis history.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : history.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-600 font-medium">No analyses yet.</p>
          <p className="text-gray-400 text-sm mt-1">Go to the home page and upload your resume!</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">Analyze a Resume</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {history.map(r => (
            <div key={r.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <p className="font-medium text-gray-800 text-sm truncate">{r.filename}</p>
                <span className={`badge flex-shrink-0 ml-2 ${
                  r.atsScore >= 80 ? 'bg-green-100 text-green-800' :
                  r.atsScore >= 60 ? 'bg-sky-100 text-sky-800' :
                  r.atsScore >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {r.atsScore}/100
                </span>
              </div>
              <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {r.skills.slice(0, 5).map(s => (
                  <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>
                ))}
                {r.skills.length > 5 && <span className="text-xs text-gray-400">+{r.skills.length - 5} more</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
