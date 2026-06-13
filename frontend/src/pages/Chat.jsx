import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import Spinner from "../components/Spinner";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);
  const [input, setInput] = useState("");
  const [reportId, setReportId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollerRef = useRef(null);

  useEffect(() => {
    Promise.all([api.get("/chat/history"), api.get("/upload")])
      .then(([m, r]) => {
        setMessages(m.data);
        setReports(r.data);
      })
      .catch(() => {
        toast.error("Failed to load chat");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const send = async (e) => {
    e.preventDefault();

    const content = input.trim();

    if (!content || sending) return;

    const tempMessage = {
      _id: `tmp-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInput("");
    setSending(true);

    try {
      const { data } = await api.post("/chat", {
        content,
        reportId: reportId || undefined,
      });

      setMessages((prev) => [
        ...prev,
        {
          _id: data.id,
          role: "assistant",
          content: data.content,
        },
      ]);

      setReportId("");
    } catch (err) {
      toast.error(err.response?.data?.error || "AI request failed");
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Clear the entire conversation?")) return;

    try {
      await api.delete("/chat/history");
      setMessages([]);
      toast.success("Conversation cleared");
    } catch {
      toast.error("Failed to clear conversation");
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spinner size={8} />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-7rem)]">
      {/* Background Glow */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="relative h-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-cyan-100 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-200">
              <svg
                width="22"
                height="22"
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

            <div>
              <h1 className="font-bold text-lg text-slate-800">
                MediQ AI Assistant
              </h1>

              <p className="text-xs text-slate-500">
                Not a substitute for professional medical advice
              </p>
            </div>
          </div>

          <button
            onClick={clearHistory}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            Clear Chat
          </button>
        </header>

        {/* Messages */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-slate-50/50"
        >
          {messages.length === 0 && !sending && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto rounded-full bg-cyan-50 flex items-center justify-center mb-5">
                  <span className="text-3xl">💬</span>
                </div>

                <h3 className="text-lg font-semibold text-slate-800">
                  Start a conversation
                </h3>

                <p className="text-slate-500 mt-2">
                  Ask about symptoms, medications, diseases, health concerns,
                  or attach a medical report for AI analysis.
                </p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-3 text-sm whitespace-pre-wrap rounded-2xl ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-br-md shadow-md shadow-cyan-200"
                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 shadow-sm text-slate-500 px-4 py-3 rounded-2xl flex items-center gap-2">
                <Spinner size={4} />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <form
          onSubmit={send}
          className="border-t border-slate-100 bg-white p-4"
        >
          {reports.length > 0 && (
            <select
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              className="w-full mb-3 px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            >
              <option value="">
                📎 Attach a medical report (optional)
              </option>

              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.originalName}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a health question..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />

            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-200 hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Spinner size={4} />
                  Sending
                </>
              ) : (
                <>
                  Send
                  <span>➜</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}