import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
      <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
      <p className="text-sm text-slate-500 mb-6">It only takes a minute</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button
          disabled={busy}
          className="w-full bg-brand-500 text-white py-2 rounded-md hover:bg-brand-600 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy && <Spinner size={4} />} Create account
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
