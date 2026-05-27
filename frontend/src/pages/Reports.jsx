import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import Spinner from '../components/Spinner';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const load = () => api.get('/upload').then((res) => setReports(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Report uploaded');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this report?')) return;
    await api.delete(`/upload/${id}`);
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success('Deleted');
  };

  const summarize = (r) => {
   
    navigate('/chat');
    setTimeout(() => {
      toast(`Tip: attach "${r.originalName}" from the dropdown and ask "Summarize this report".`, {
        duration: 5000,
      });
    }, 300);
  };

  if (loading) {
    return (
      <div className="h-[40vh] grid place-items-center">
        <Spinner size={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Medical Reports</h1>
          <p className="text-sm text-slate-500">PDF, JPG, PNG, or WEBP — up to 10 MB.</p>
        </div>
        <label className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 cursor-pointer flex items-center gap-2">
          {uploading && <Spinner size={4} />}
          {uploading ? 'Uploading…' : 'Upload report'}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
      </header>

      {reports.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
          No reports yet. Upload your first one above.
        </div>
      ) : (
        <ul className="bg-white border border-slate-200 rounded-xl divide-y">
          {reports.map((r) => (
            <li key={r.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-slate-800 hover:text-brand-600 truncate block">
                  {r.originalName}
                </a>
                <p className="text-xs text-slate-500">
                  {(r.size / 1024).toFixed(1)} KB · {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => summarize(r)}
                  className="px-3 py-1.5 text-sm bg-brand-50 text-brand-700 rounded-md hover:bg-brand-100"
                >
                  Ask AI
                </button>
                <button
                  onClick={() => remove(r.id)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
