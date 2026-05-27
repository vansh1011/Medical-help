import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/upload'), api.get('/chat/history')])
      .then(([r, m]) => {
        setReports(r.data);
        setMessages(m.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[40vh] grid place-items-center">
        <Spinner size={8} />
      </div>
    );
  }

  const recentChats = messages.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-slate-500 text-sm">Your reports and recent conversations</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent reports</h2>
            <Link to="/reports" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-500">No reports uploaded yet.</p>
          ) : (
            <ul className="divide-y">
              {reports.slice(0, 5).map((r) => (
                <li key={r.id} className="py-2 flex justify-between text-sm">
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-800 hover:text-brand-600 truncate">
                    {r.originalName}
                  </a>
                  <span className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

       
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent AI chats</h2>
            <Link to="/chat" className="text-sm text-brand-600 hover:underline">Open chat</Link>
          </div>
          {recentChats.length === 0 ? (
            <p className="text-sm text-slate-500">No messages yet. Start a conversation!</p>
          ) : (
            <ul className="space-y-3">
              {recentChats.map((m) => (
                <li key={m._id} className="text-sm">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${
                    m.role === 'user' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.role}
                  </span>
                  <span className="text-slate-700">{m.content.slice(0, 100)}{m.content.length > 100 ? '…' : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
