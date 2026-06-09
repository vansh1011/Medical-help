import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import Spinner from "../components/Spinner";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const load = () => api.get("/upload").then((res) => setReports(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    // there may be a case when user open files but didn't select anything then file = undefine
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Report uploaded");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      // Clearing the Upload filed after uploading
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this report?")) return;
    await api.delete(`/upload/${id}`);
    setReports((prev) => prev.filter((result) => result.id !== id));
    toast.success("Deleted");
  };

  const summarize = (result) => {
    navigate("/chat");
    setTimeout(() => {
      toast(
        `Tip: attach "${result.originalName}" from the dropdown and ask "Summarize this report".`,
        {
          duration: 5000,
        },
      );
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
            Medical Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            PDF, JPG, PNG, or WEBP — up to 10 MB.
          </p>
        </div>

      
        <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200 shadow-sm shadow-cyan-200 cursor-pointer">
          {uploading && <Spinner size={4} />}
          {uploading ? "Uploading…" : "Upload report"}
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
          {reports.map((result) => (
            <li key={result.id} className="p-4">
             
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

               
                <div className="min-w-0">
                  <a
                    href={result.url}
                    // Using _blank allow to open the url in different tab otherwise the current page replaced with this url
                    target="_blank"
                    // "noreferrer" prevents the destination website from knowing which page the user came from.
                    rel="noreferrer"
                    className="font-medium text-slate-800 hover:text-cyan-600 truncate block transition-colors duration-150"
                  >
                    {result.originalName}
                  </a>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(result.size / 1024).toFixed(1)} KB ·{" "}
                    {new Date(result.createdAt).toLocaleString()}
                  </p>
                </div>

              
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => summarize(result)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-cyan-50 text-cyan-700 rounded-md hover:bg-cyan-100 transition-colors duration-150 font-medium"
                  >
                    Ask AI
                  </button>
                  <button
                    onClick={() => remove(result.id)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors duration-150 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}