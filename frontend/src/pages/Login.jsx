import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4 overflow-hidden bg-slate-50">
      
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-100 rounded-full blur-3xl opacity-40" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-xl shadow-cyan-100 p-8">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-200">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold mt-4">
              <span className="text-slate-800">Medi</span>
              <span className="text-cyan-600">Q</span>
            </h1>

            <h2 className="text-xl font-semibold text-slate-800 mt-5">
              Welcome Back
            </h2>

            <p className="text-slate-500 text-center mt-2">
              Sign in to access your medical dashboard and AI assistant.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="px-3 py-1 text-xs rounded-full bg-cyan-50 text-cyan-700">
                AI Assistant
              </span>

              <span className="px-3 py-1 text-xs rounded-full bg-cyan-50 text-cyan-700">
                Medical Reports
              </span>

              <span className="px-3 py-1 text-xs rounded-full bg-cyan-50 text-cyan-700">
                Nearby Hospitals
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>

            <button
              disabled={busy}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-cyan-200 hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {busy && <Spinner size={4} />}
              Log In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}