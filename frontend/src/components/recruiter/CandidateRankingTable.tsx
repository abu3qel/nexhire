"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RankedCandidate, ApplicationStatus } from "@/lib/types";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { Badge } from "@/components/ui/Badge";
import { StatusSelector } from "@/components/recruiter/StatusSelector";

interface Props {
  candidates: RankedCandidate[];
  jobId: string;
  mode?: "composite" | "baseline";
}

function ScoreCell({ value }: { value?: number }) {
  if (value == null) return <span className="text-slate-300 text-xs">—</span>;
  const pct = Math.round(value * 100);
  const color = value >= 0.7 ? "text-emerald-600" : value >= 0.4 ? "text-amber-600" : "text-red-600";
  return (
    <div className="min-w-[56px]">
      <div className={`text-xs font-semibold ${color} mb-1`}>{pct}%</div>
      <ScoreBar value={value} showLabel={false} size="sm" />
    </div>
  );
}

function AssessmentBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "amber" | "blue" | "green" | "red"; label: string; pulse?: boolean }> = {
    pending:    { variant: "amber", label: "Pending", pulse: true },
    processing: { variant: "blue",  label: "Processing", pulse: true },
    completed:  { variant: "green", label: "Done" },
    failed:     { variant: "red",   label: "Failed" },
  };
  const cfg = map[status] ?? { variant: "gray" as const, label: status };
  return <Badge variant={cfg.variant as "amber" | "blue" | "green" | "red"} pulse={cfg.pulse}>{cfg.label}</Badge>;
}

function RankChange({ change }: { change?: number }) {
  if (change == null || change === 0) return <span className="text-slate-300 text-xs">—</span>;
  if (change > 0) return <span className="text-emerald-600 text-xs font-semibold">↑{change}</span>;
  return <span className="text-red-500 text-xs font-semibold">↓{Math.abs(change)}</span>;
}

const thCls = "text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4 whitespace-nowrap";

export function CandidateRankingTable({ candidates, jobId, mode = "composite" }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = mode === "composite"
    ? [...candidates].sort((a, b) => (b.composite_score ?? -1) - (a.composite_score ?? -1))
    : [...candidates].sort((a, b) => (b.baseline_score ?? -1) - (a.baseline_score ?? -1));

  if (sorted.length === 0) {
    return (
      <div className="text-center py-14 text-slate-400 text-sm">No applications yet</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className={thCls}>#</th>
            <th className={thCls}>Candidate</th>
            <th className={`${thCls} hidden sm:table-cell`}>Resume</th>
            <th className={`${thCls} hidden lg:table-cell`}>Cover Letter</th>
            <th className={`${thCls} hidden md:table-cell`}>GitHub</th>
            <th className={`${thCls} hidden lg:table-cell`}>SO</th>
            <th className={`${thCls} hidden lg:table-cell`}>Portfolio</th>
            <th className={thCls}>Score</th>
            <th className={`${thCls} hidden sm:table-cell`}>Δ Rank</th>
            <th className={`${thCls} hidden sm:table-cell`}>Assessment</th>
            <th className={`${thCls} hidden md:table-cell`}>Stage</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => {
            const expanded = expandedId === c.application_id;
            return (
              <>
                <tr
                  key={c.application_id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expanded ? null : c.application_id)}
                >
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono font-medium text-slate-400">
                      {mode === "composite" ? c.rank : (c.baseline_rank ?? i + 1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 text-sm">{c.candidate_name}</div>
                    <div className="text-xs text-slate-400">{c.candidate_email}</div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell"><ScoreCell value={c.resume_score} /></td>
                  <td className="py-3 px-4 hidden lg:table-cell"><ScoreCell value={c.cover_letter_score} /></td>
                  <td className="py-3 px-4 hidden md:table-cell"><ScoreCell value={c.github_score} /></td>
                  <td className="py-3 px-4 hidden lg:table-cell"><ScoreCell value={c.stackoverflow_score} /></td>
                  <td className="py-3 px-4 hidden lg:table-cell"><ScoreCell value={c.portfolio_score} /></td>
                  <td className="py-3 px-4">
                    {c.composite_score != null ? (
                      <span className="text-base font-bold font-mono text-blue-600">
                        {Math.round(c.composite_score * 100)}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell"><RankChange change={c.rank_change} /></td>
                  <td className="py-3 px-4 hidden sm:table-cell"><AssessmentBadge status={c.assessment_status} /></td>
                  <td className="py-3 px-4 hidden md:table-cell" onClick={e => e.stopPropagation()}>
                    <StatusSelector
                      applicationId={c.application_id}
                      currentStatus={c.application_status as ApplicationStatus}
                      jobId={jobId}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/recruiter/jobs/${jobId}/candidates/${c.candidate_id}?applicationId=${c.application_id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap"
                      >
                        View
                      </Link>
                      {expanded
                        ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </td>
                </tr>

                <AnimatePresence>
                  {expanded && (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={12} className="py-0">
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                              { label: "Resume", score: c.resume_score },
                              { label: "Cover Letter", score: c.cover_letter_score },
                              { label: "GitHub", score: c.github_score },
                              { label: "Stack Overflow", score: c.stackoverflow_score },
                              { label: "Portfolio", score: c.portfolio_score },
                            ].map(({ label, score }) => (
                              <div key={label}>
                                <div className="text-xs text-slate-500 mb-1 font-medium">{label}</div>
                                {score != null
                                  ? <ScoreBar value={score} size="md" />
                                  : <span className="text-xs text-slate-300">Not provided</span>
                                }
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              Baseline (resume-only):{" "}
                              <span className="font-medium text-slate-700">
                                {c.baseline_score != null ? `${Math.round(c.baseline_score * 100)}%` : "—"}
                              </span>
                              {" · "}Rank change:{" "}
                              <span className={c.rank_change && c.rank_change > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                                {c.rank_change != null
                                  ? (c.rank_change > 0 ? `↑${c.rank_change}` : `↓${Math.abs(c.rank_change)}`)
                                  : "—"}
                              </span>
                            </span>
                            <Link href={`/recruiter/jobs/${jobId}/candidates/${c.candidate_id}?applicationId=${c.application_id}`}>
                              <span className="text-xs text-blue-600 hover:underline font-medium">Open full profile →</span>
                            </Link>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
