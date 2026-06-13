import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Spinner from "../components/Spinner";
import { FileText, MessageCircle, Bot, Hospital } from "lucide-react";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/upload"), api.get("/chat/history")])
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
    <div className="relative space-y-8">
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute right-0 top-40 w-72 h-72 bg-sky-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 to-cyan-600 p-8 text-white shadow-xl shadow-cyan-200">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-3">Welcome to MediQ</h1>

          <p className="text-cyan-50">
            Upload reports, chat with AI about health concerns, and find nearby
            hospitals — all in one place.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/chat"
              className="bg-white text-cyan-600 font-semibold px-5 py-2 rounded-xl hover:bg-cyan-50 transition"
            >
              Open AI Chat
            </Link>

            <Link
              to="/reports"
              className="bg-cyan-700/30 border border-cyan-300 px-5 py-2 rounded-xl hover:bg-cyan-700/40 transition"
            >
              Manage Reports
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-lg shadow-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Uploaded Reports</p>

              <h2 className="text-3xl font-bold text-slate-800 mt-1">
                {reports.length}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center">
              <FileText size={28} className="text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-lg shadow-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">AI Messages</p>

              <h2 className="text-3xl font-bold text-slate-800 mt-1">
                {messages.length}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center">
              <MessageCircle size={28} className="text-cyan-600" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-cyan-50 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-slate-800">Recent Reports</h2>

            <Link
              to="/reports"
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-10">
              <div className="flex justify-center mb-3">
                <FileText size={42} className="text-cyan-500" />
              </div>

              <p className="text-slate-500">No reports uploaded yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reports.slice(0, 5).map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 transition"
                >
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-slate-700 truncate hover:text-cyan-600"
                  >
                    {r.originalName}
                  </a>

                  <span className="text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-cyan-50 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-slate-800">
              Recent AI Chats
            </h2>

            <Link
              to="/chat"
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              Open Chat →
            </Link>
          </div>

          {recentChats.length === 0 ? (
            <div className="text-center py-10">
              <div className="flex justify-center mb-3">
                <MessageCircle size={42} className="text-cyan-500" />
              </div>

              <p className="text-slate-500">No conversations yet.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {recentChats.map((m) => (
                <li
                  key={m._id}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-cyan-50 transition"
                >
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                      m.role === "user"
                        ? "bg-cyan-100 text-cyan-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {m.role}
                  </span>

                  <p className="text-sm text-slate-700">
                    {m.content.slice(0, 100)}
                    {m.content.length > 100 ? "..." : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <Link
          to="/chat"
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-cyan-200 transition"
        >
          <Bot size={28} className="text-cyan-600 mb-2" />
          <h3 className="font-semibold text-slate-800">AI Assistant</h3>
          <p className="text-sm text-slate-500 mt-1">
            Ask health-related questions.
          </p>
        </Link>

        <Link
          to="/reports"
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-cyan-200 transition"
        >
          <FileText size={28} className="text-cyan-600 mb-2" />
          <h3 className="font-semibold text-slate-800">Reports</h3>
          <p className="text-sm text-slate-500 mt-1">
            Manage uploaded reports.
          </p>
        </Link>

        <Link
          to="/nearhospital"
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-cyan-200 transition"
        >
          <Hospital size={28} className="text-cyan-600 mb-2" />
          <h3 className="font-semibold text-slate-800">Hospitals</h3>
          <p className="text-sm text-slate-500 mt-1">
            Find nearby hospitals quickly.
          </p>
        </Link>
      </section>
    </div>
  );
}
