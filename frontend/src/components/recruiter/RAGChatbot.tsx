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
      const { data } = await ragApi.chat({
        application_id: applicationId,
        message: text,
        conversation_history: history,
      });
      const assistantMsg: RAGMessage = { role: "assistant", content: data.answer, sources: data.sources };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't retrieve an answer. Please try again.", sources: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e] rounded-2xl border border-gray-800">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex-shrink-0">
        <h3 className="font-sora font-semibold text-white text-sm">Ask about this candidate</h3>
        <p className="text-xs text-gray-500 mt-0.5">Powered by RAG over candidate data</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-gray-600 text-center mb-3">Suggested questions</p>
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-[#111827] border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-teal-500/20 transition-all"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#00d4aa] text-[#0a0f1e] rounded-br-sm"
                    : "bg-[#1f2937] text-gray-200 rounded-bl-sm border border-gray-700"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 px-1">
                    <span className="text-xs text-gray-600">Sources:</span>
                    {msg.sources.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700 select-none">
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
            <div className="bg-[#1f2937] rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-700">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]"
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
      <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about this candidate..."
            disabled={loading}
            className="flex-1 bg-[#111827] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-[#00d4aa] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#00b894] transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 text-[#0a0f1e]" />
          </button>
        </div>
      </div>
    </div>
  );
}
