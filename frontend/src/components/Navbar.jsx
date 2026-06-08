import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-cyan-700 bg-cyan-50'
        : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-50'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-3 py-2.5 rounded-md text-base font-medium transition-all duration-200 ${
      isActive
        ? 'text-cyan-700 bg-cyan-50 font-semibold'
        : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-50'
    }`;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          
          
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md shadow-cyan-200 group-hover:shadow-cyan-300 transition-shadow duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">
              <span className="text-slate-800">Medi</span>
              <span className="text-cyan-600">Q</span>
            </span>
          </Link>

          
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
                <NavLink to="/chat" className={linkClass}>AI Chat</NavLink>
                <NavLink to='/nearhospital' className={linkClass}>Nearest Hospital</NavLink>
                <NavLink to="/reports" className={linkClass}>Reports</NavLink>

                <div className="w-px h-5 bg-slate-200 mx-2" />

                <div className="flex items-center gap-2 px-2 py-1 rounded-md">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-600 font-medium hidden lg:inline">
                    {user.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-1 px-3 py-1.5 text-sm rounded-md text-slate-500 border border-slate-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all duration-200 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Login</NavLink>
                <NavLink
                  to="/register"
                  className="ml-1 px-4 py-2 text-sm rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors duration-200 shadow-sm shadow-cyan-200"
                >
                  Get Started
                </NavLink>
              </>
            )}
          </div>

          
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 pb-4 pt-2 space-y-1.5 Array flex flex-col animate-in slide-in-from-top-2 duration-150">
            {user ? (
              <>
                
                <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-slate-50 rounded-lg mx-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-400">Patient Account</p>
                  </div>
                </div>

                
                <NavLink
                  to="/"
                  end
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/chat"
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  AI Chat
                </NavLink>
                <NavLink
                  to='/nearhospital'
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Nearest Hospital
                </NavLink>
                <NavLink
                  to="/reports"
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Reports
                </NavLink>

                
                <div className="pt-2 mt-2 border-t border-slate-100 mx-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-base rounded-md text-red-500 hover:bg-red-50 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-1 space-y-2">
                <NavLink
                  to="/login"
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="block w-full px-3 py-2.5 text-base rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}