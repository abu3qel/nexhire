"use client";
import Link from "next/link";
import { FileText, Github, MessageSquare, Globe, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const modalities = [
  { icon: FileText, label: "Resume",        desc: "SBERT semantic similarity against the job description" },
  { icon: Github,   label: "GitHub",        desc: "Code quality, commit history, and language diversity" },
  { icon: Award,    label: "Stack Overflow", desc: "Reputation, acceptance rate, and domain expertise" },
  { icon: MessageSquare, label: "Cover Letter", desc: "Clarity, motivation, and role relevance" },
  { icon: Globe,    label: "Portfolio",     desc: "Project complexity and technology relevance" },
];

const steps = [
  { n: "01", title: "Post a role",        body: "Create a job posting and set how much each signal should influence the final score." },
  { n: "02", title: "Candidates apply",   body: "Applicants submit their resume, GitHub, Stack Overflow, cover letter, and portfolio." },
  { n: "03", title: "AI runs the scores", body: "Each modality is independently scored and fused with confidence weighting." },
  { n: "04", title: "Review the ranking", body: "Compare ranked candidates, inspect score breakdowns, and chat with the RAG assistant." },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const dashboardHref = user?.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/jobs";

  return (
    <main className="min-h-screen bg-[#08090E] text-white selection:bg-brand-600/30">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] sticky top-0 z-50 backdrop-blur-md bg-[#08090E]/90">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">N</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-white">NexHire</span>
          </div>
          <div className="flex items-center gap-1">
            {!loading && user ? (
              <>
                <span className="text-sm text-white/50 px-3 hidden sm:block">
                  {user.full_name.split(" ")[0]}
                </span>
                <Link href={dashboardHref} className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Go to dashboard
                </Link>
              </>
            ) : !loading ? (
              <>
                <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/[0.05]">
                  Sign in
                </Link>
                <Link href="/register" className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Get started
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-brand-400 uppercase mb-8 px-3 py-1.5 rounded-full border border-brand-500/25 bg-brand-500/[0.07]">
            QMUL CS Final Year Project
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Hire beyond<br />
            <span className="text-brand-400">the resume.</span>
          </h1>

          <p className="text-white/55 text-lg max-w-xl mb-10 leading-relaxed">
            NexHire fuses five independent signals into a single ranked candidate list. Confidence-weighted AI assessment that surfaces who actually fits the role.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {user?.role === "recruiter" ? (
              <Link href="/recruiter/dashboard">
                <button className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25">
                  Open recruiter portal
                </button>
              </Link>
            ) : user?.role === "candidate" ? (
              <Link href="/candidate/jobs">
                <button className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25">
                  Browse open roles
                </button>
              </Link>
            ) : !loading ? (
              <>
                <Link href="/recruiter/dashboard">
                  <button className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25">
                    Open recruiter portal
                  </button>
                </Link>
                <Link href="/candidate/jobs">
                  <button className="px-6 py-3 bg-white/[0.06] text-white/80 font-semibold rounded-lg text-sm border border-white/[0.10] hover:bg-white/[0.10] transition-colors">
                    Browse as candidate
                  </button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Modalities */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Assessment signals</p>
            <h2 className="text-2xl font-bold text-white">Five dimensions, one score.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {modalities.map((m, i) => (
              <div
                key={m.label}
                className="group rounded-xl bg-white/[0.03] border border-white/[0.07] p-5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-600/15 flex items-center justify-center mb-4">
                  <m.icon className="w-4 h-4 text-brand-400" />
                </div>
                <div className="font-semibold text-sm text-white mb-1.5">{m.label}</div>
                <div className="text-xs text-white/40 leading-relaxed">{m.desc}</div>
                <div className="mt-4 text-xs font-mono text-white/20">0{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">How it works</p>
            <h2 className="text-2xl font-bold text-white">From posting to ranked list in minutes.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="font-mono text-4xl font-bold text-white/[0.06] mb-4 leading-none">{s.n}</div>
                <div className="font-semibold text-sm text-white mb-2">{s.title}</div>
                <div className="text-xs text-white/40 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center">
              <span className="text-white text-[9px] font-black">N</span>
            </div>
            <span className="text-xs text-white/30 font-medium">NexHire</span>
          </div>
          <span className="text-xs text-white/20">GPT-4o-mini · SBERT · pgvector · QMUL CS 2026</span>
        </div>
      </div>
    </main>
  );
}
