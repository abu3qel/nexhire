"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  if (value == null) return <span className="text-gray-600 text-xs">—</span>;
  const pct = Math.round(value * 100);
  const color = value >= 0.7 ? "text-[#00d4aa]" : value >= 0.4 ? "text-amber-400" : "text-red-400";
  return (
    <div className="min-w-[60px]">
      <div className={`text-xs font-mono font-semibold ${color} mb-1`}>{pct}%</div>
      <ScoreBar value={value} showLabel={false} size="sm" />
    </div>
  );
}

function AssessmentBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "amber" | "teal" | "green" | "red"; label: string; pulse?: boolean }> = {
    pending: { variant: "amber", label: "Pending", pulse: true },
    processing: { variant: "teal", label: "Processing", pulse: true },
    completed: { variant: "green", label: "Done" },
    failed: { variant: "red", label: "Failed" },
  };
  const cfg = map[status] || { variant: "gray" as const, label: status };
  return <Badge variant={cfg.variant} pulse={cfg.pulse}>{cfg.label}</Badge>;
}

function RankChange({ change }: { change?: number }) {
  if (change == null || change === 0) return <span className="text-gray-600 text-xs">—</span>;
  if (change > 0) return <span className="text-[#00d4aa] text-xs font-semibold flex items-center gap-0.5">↑{change}</span>;
  return <span className="text-red-400 text-xs font-semibold flex items-center gap-0.5">↓{Math.abs(change)}</span>;
}

export function CandidateRankingTable({ candidates, jobId, mode = "composite" }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = mode === "composite"
    ? [...candidates].sort((a, b) => (b.composite_score ?? -1) - (a.composite_score ?? -1))
    : [...candidates].sort((a, b) => (b.baseline_score ?? -1) - (a.baseline_score ?? -1));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Rank</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Candidate</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Resume</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Cover Letter</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">GitHub</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">SO</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Portfolio</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Composite</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Δ Rank</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Assessment</th>
            <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Stage</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => {
            const expanded = expandedId === c.application_id;
            return (
              <>
                <motion.tr
                  key={c.application_id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-800/50 hover:bg-[#1f2937]/50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expanded ? null : c.application_id)}
                >
                  <td className="py-3 pr-4">
                    <span className="text-xs font-mono text-gray-400">#{mode === "composite" ? c.rank : c.baseline_rank ?? i + 1}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-white">{c.candidate_name}</div>
                    <div className="text-xs text-gray-500">{c.candidate_email}</div>
                  </td>
                  <td className="py-3 pr-4"><ScoreCell value={c.resume_score} /></td>
                  <td className="py-3 pr-4"><ScoreCell value={c.cover_letter_score} /></td>
                  <td className="py-3 pr-4"><ScoreCell value={c.github_score} /></td>
                  <td className="py-3 pr-4"><ScoreCell value={c.stackoverflow_score} /></td>
                  <td className="py-3 pr-4"><ScoreCell value={c.portfolio_score} /></td>
                  <td className="py-3 pr-4">
                    {c.composite_score != null ? (
                      <span className="text-base font-bold font-mono text-[#00d4aa]">
                        {Math.round(c.composite_score * 100)}
                      </span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 pr-4"><RankChange change={c.rank_change} /></td>
                  <td className="py-3 pr-4"><AssessmentBadge status={c.assessment_status} /></td>
                  <td className="py-3 pr-4" onClick={e => e.stopPropagation()}>
                    <StatusSelector
                      applicationId={c.application_id}
                      currentStatus={c.application_status as ApplicationStatus}
                      jobId={jobId}
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/recruiter/jobs/${jobId}/candidates/${c.candidate_id}?applicationId=${c.application_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-[#00d4aa] hover:underline"
                      >
                        View Profile
                      </Link>
                      {expanded ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
                    </div>
                  </td>
                </motion.tr>

                <AnimatePresence>
                  {expanded && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={12} className="py-0">
                        <div className="bg-[#0a0f1e] border border-teal-500/10 rounded-xl mx-2 my-2 p-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                              { label: "Resume", score: c.resume_score },
                              { label: "Cover Letter", score: c.cover_letter_score },
                              { label: "GitHub", score: c.github_score },
                              { label: "Stack Overflow", score: c.stackoverflow_score },
                              { label: "Portfolio", score: c.portfolio_score },
                            ].map(({ label, score }) => (
                              <div key={label}>
                                <div className="text-xs text-gray-500 mb-1">{label}</div>
                                {score != null ? (
                                  <ScoreBar value={score} size="md" />
                                ) : (
                                  <span className="text-xs text-gray-600">Not provided</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Baseline (resume-only): <span className="text-white">{c.baseline_score != null ? `${Math.round(c.baseline_score * 100)}%` : "—"}</span>
                              {" "} · Rank change: <span className={c.rank_change && c.rank_change > 0 ? "text-[#00d4aa]" : "text-red-400"}>
                                {c.rank_change != null ? (c.rank_change > 0 ? `↑${c.rank_change}` : `↓${Math.abs(c.rank_change)}`) : "—"}
                              </span>
                            </span>
                            <Link href={`/recruiter/jobs/${jobId}/candidates/${c.candidate_id}?applicationId=${c.application_id}`}>
                              <span className="text-xs text-[#00d4aa] hover:underline">Open full profile →</span>
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

      {candidates.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">No applications yet</div>
      )}
    </div>
  );
}
