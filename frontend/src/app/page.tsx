"use client";
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
    <main className="min-h-screen bg-[#0F172A] text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-white">NexHire</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-6 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5">
          QMUL CS Final Year Project
        </span>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5 tracking-tight">
          Hire beyond the resume.
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          NexHire fuses signals from five data sources — Resume, GitHub, Stack Overflow, Cover Letter, and Portfolio — into a single ranked candidate list using AI-powered multi-modal assessment.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/recruiter/dashboard">
            <button className="px-7 py-3 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Recruiter portal →
            </button>
          </Link>
          <Link href="/candidate/jobs">
            <button className="px-7 py-3 bg-slate-800 text-slate-200 font-semibold rounded-lg text-sm border border-slate-700 hover:bg-slate-700 transition-colors">
              Candidate portal
            </button>
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-slate-800 bg-slate-800/30">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{s.label}</div>
                <div className="text-xs text-slate-500">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modalities */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-3">Five Assessment Dimensions</h2>
          <p className="text-slate-400 text-sm">Each modality contributes a weighted score to the final composite ranking.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {modalities.map((m) => (
            <div
              key={m.label}
              className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-5 hover:border-slate-600 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <m.icon className="w-4 h-4 text-blue-400" />
              </div>
              <div className="font-semibold text-sm text-white mb-1">{m.label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center pb-16 px-6">
        <p className="text-slate-600 text-xs">
          Built for QMUL CS Final Year Project · OpenAI GPT-4o-mini + SBERT + pgvector
        </p>
      </section>
    </main>
  );
}
