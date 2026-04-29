"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { ragApi } from "@/lib/api";
import { RAGMessage } from "@/lib/types";

const STARTER_QUESTIONS = [
  "What are this candidate's strongest technical skills?",
  "How does their GitHub activity compare to the job requirements?",
  "What concerns might I have about this candidate?",
  "Summarise their Stack Overflow expertise",
];

interface Props {
  applicationId: string;
}

export function RAGChatbot({ applicationId }: Props) {
  const [messages, setMessages] = useState<RAGMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: RAGMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await ragApi.chat({ application_id: applicationId, message: text, conversation_history: history });
      setMessages(prev => [...prev, { role: "assistant", content: data.answer, sources: data.sources }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't retrieve an answer. Please try again.", sources: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <h3 className="font-semibold text-slate-900 text-sm">Ask about this candidate</h3>
        <p className="text-xs text-slate-400 mt-0.5">Powered by RAG over candidate data</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-slate-400 text-center mb-3">Suggested questions</p>
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="w-full text-left text-xs px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 px-1">
                    <span className="text-xs text-slate-400">Sources:</span>
                    {msg.sources.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 select-none">
                        {s.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about this candidate..."
            disabled={loading}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
