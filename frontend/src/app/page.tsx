"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Github, MessageSquare, Globe, BarChart2, Zap, Users, TrendingUp } from "lucide-react";

const modalities = [
  { icon: FileText, label: "Resume", desc: "SBERT semantic matching against job description" },
  { icon: Github, label: "GitHub", desc: "Code quality, commit history, language diversity" },
  { icon: MessageSquare, label: "Stack Overflow", desc: "Reputation, acceptance rate, domain expertise" },
  { icon: FileText, label: "Cover Letter", desc: "Clarity, motivation, and role relevance scoring" },
  { icon: Globe, label: "Portfolio", desc: "Project complexity and tech stack relevance" },
];

const stats = [
  { icon: Zap, label: "5 Modalities", desc: "Comprehensive signal fusion" },
  { icon: Users, label: "AI-Powered", desc: "GPT-4o-mini + SBERT" },
  { icon: TrendingUp, label: "RAG Chatbot", desc: "Interrogate any candidate" },
  { icon: BarChart2, label: "Ranked List", desc: "Instant composite scores" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-gray-100 overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,212,170,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,0.05) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#00d4aa] uppercase mb-6 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/5">
            Final Year Project · QMUL
          </span>

          <h1 className="font-sora text-5xl md:text-7xl font-bold leading-tight mb-4">
            Beyond the{" "}
            <span className="text-[#00d4aa] relative">
              Resume.
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            NexHire fuses signals from 5 data sources — Resume, GitHub, Stack Overflow, Cover Letter, and Portfolio — into a single ranked candidate list using AI-powered multi-modal assessment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recruiter/dashboard">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 bg-[#00d4aa] text-[#0a0f1e] font-semibold rounded-xl text-base hover:bg-[#00b894] transition-colors shadow-lg shadow-teal-500/20"
              >
                I&apos;m a Recruiter →
              </motion.button>
            </Link>
            <Link href="/candidate/jobs">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 bg-[#1f2937] text-gray-100 font-semibold rounded-xl text-base border border-gray-700 hover:border-gray-600 hover:bg-[#374151] transition-colors"
              >
                I&apos;m a Candidate
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 text-gray-600 text-sm flex flex-col items-center gap-1"
        >
          <span>Scroll to explore</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 border-y border-gray-800 bg-[#111827]/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{s.label}</div>
                <div className="text-xs text-gray-500">{s.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modality cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-sora text-3xl font-bold mb-3">Five Assessment Dimensions</h2>
          <p className="text-gray-400">Each modality contributes a weighted score to the final composite ranking.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {modalities.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-[#111827] border border-gray-800 p-5 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-3 group-hover:bg-teal-500/20 transition-colors">
                <m.icon className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <div className="font-semibold text-sm text-white mb-1">{m.label}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="relative z-10 text-center pb-20 px-6">
        <p className="text-gray-600 text-sm">
          Built for QMUL CS Final Year Project · Powered by OpenAI GPT-4o-mini + SBERT + pgvector
        </p>
      </section>
    </main>
  );
}
