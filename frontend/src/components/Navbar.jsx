import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:text-brand-600'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="inline-block w-7 h-7 rounded-md bg-brand-500 text-white grid place-items-center">
            +
          </span>
          Medical Help
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/chat" className={linkClass}>AI Chat</NavLink>
            <NavLink to="/reports" className={linkClass}>Reports</NavLink>
            <span className="hidden sm:inline ml-3 text-sm text-slate-500">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 text-sm rounded-md bg-slate-100 hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink
              to="/register"
              className="px-3 py-1.5 text-sm rounded-md bg-brand-500 text-white hover:bg-brand-600"
            >
              Sign up
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
