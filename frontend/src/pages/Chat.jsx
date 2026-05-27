import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import Spinner from '../components/Spinner';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);
  const [input, setInput] = useState('');
  const [reportId, setReportId] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef(null);

  
  useEffect(() => {
    Promise.all([api.get('/chat/history'), api.get('/upload')])
      .then(([m, r]) => {
        setMessages(m.data);
        setReports(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    
    setMessages((prev) => [...prev, { _id: 'tmp-' + Date.now(), role: 'user', content }]);
    setInput('');
    setSending(true);
    try {
      const { data } = await api.post('/chat', { content, reportId: reportId || undefined });
      setMessages((prev) => [...prev, { _id: data.id, role: 'assistant', content: data.content }]);
      setReportId('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI request failed');
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Clear the entire conversation?')) return;
    await api.delete('/chat/history');
    setMessages([]);
    toast.success('Conversation cleared');
  };

  if (loading) {
    return (
      <div className="h-[40vh] grid place-items-center">
        <Spinner size={8} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-[calc(100vh-7rem)]">
      <header className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h1 className="font-semibold">AI Medical Assistant</h1>
          <p className="text-xs text-slate-500">Not a substitute for professional medical advice.</p>
        </div>
        <button onClick={clearHistory} className="text-sm text-slate-500 hover:text-red-600">
          Clear
        </button>
      </header>

    
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-12 text-sm">
            Ask anything about your health, symptoms, or a medical report.
          </div>
        )}
        {messages.map((m) => (
          <div key={m._id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-brand-500 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 px-3 py-2 rounded-2xl text-sm flex items-center gap-2">
              <Spinner size={4} /> Thinking…
            </div>
          </div>
        )}
      </div>

      
      <form onSubmit={send} className="p-3 border-t space-y-2">
        {reports.length > 0 && (
          <select
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-slate-50"
          >
            <option value="">(Optional) Attach a report for AI to read</option>
            {reports.map((r) => (
              <option key={r.id} value={r.id}>📎 {r.originalName}</option>
            ))}
          </select>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a health question…"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            disabled={sending || !input.trim()}
            className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
