import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">📄</span>
          <span className="font-bold text-xl text-sky-600">ResumeAI</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">Hi, {user.name.split(' ')[0]} 👋</span>
              <Link to="/dashboard" className="text-sm text-gray-700 hover:text-sky-600 font-medium">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-700 hover:text-sky-600 font-medium">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
