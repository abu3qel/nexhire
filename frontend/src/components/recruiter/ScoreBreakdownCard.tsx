"use client";
import { FileText, Github, MessageSquare, Globe, Award } from "lucide-react";
import { Assessment } from "@/lib/types";
import { ScoreBar } from "@/components/ui/ScoreBar";

interface Props {
  assessment: Assessment;
}

const MODALITIES = [
  {
    key: "resume" as const,
    icon: FileText,
    label: "Resume",
    scoreKey: "resume_score" as const,
    detailsKey: "resume_details" as const,
    getDetail: (d: Assessment["resume_details"]) =>
      d ? `${d.extracted_skills?.slice(0, 4).join(", ")} · ${d.education?.[0]?.degree || ""}` : null,
  },
  {
    key: "cover_letter" as const,
    icon: MessageSquare,
    label: "Cover Letter",
    scoreKey: "cover_letter_score" as const,
    detailsKey: "cover_letter_details" as const,
    getDetail: (d: Assessment["cover_letter_details"]) =>
      d ? `Clarity: ${Math.round((d.clarity_score || 0) * 100)}% · Motivation: ${Math.round((d.motivation_score || 0) * 100)}%` : null,
  },
  {
    key: "github" as const,
    icon: Github,
    label: "GitHub",
    scoreKey: "github_score" as const,
    detailsKey: "github_details" as const,
    getDetail: (d: Assessment["github_details"]) =>
      d ? `${d.repo_count} repos · ${d.total_commits} commits · ${Object.keys(d.top_languages || {}).slice(0, 3).join(", ")}` : null,
  },
  {
    key: "stackoverflow" as const,
    icon: Award,
    label: "Stack Overflow",
    scoreKey: "stackoverflow_score" as const,
    detailsKey: "stackoverflow_details" as const,
    getDetail: (d: Assessment["stackoverflow_details"]) =>
      d ? `Reputation: ${d.reputation?.toLocaleString()} · ${d.answer_count} answers` : null,
  },
  {
    key: "portfolio" as const,
    icon: Globe,
    label: "Portfolio",
    scoreKey: "portfolio_score" as const,
    detailsKey: "portfolio_details" as const,
    getDetail: (d: Assessment["portfolio_details"]) =>
      d ? `${d.projects_found} projects · ${d.technologies?.slice(0, 3).join(", ")}` : null,
  },
];

export function ScoreBreakdownCard({ assessment }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {MODALITIES.map((m) => {
        const score = assessment[m.scoreKey];
        const details = assessment[m.detailsKey];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detail = details ? (m.getDetail as (d: unknown) => string | null)(details) : null;

        return (
          <div key={m.key} className="rounded-xl bg-white border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <m.icon className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{m.label}</span>
            </div>

            {score != null ? (
              <>
                <div className="text-2xl font-bold text-slate-900 mb-2">
                  {Math.round(score * 100)}
                  <span className="text-sm text-slate-400 font-normal"> /100</span>
                </div>
                <ScoreBar value={score} size="md" showLabel={false} className="mb-2" />
                {detail && <p className="text-xs text-slate-500 leading-relaxed mt-1">{detail}</p>}
              </>
            ) : (
              <div className="text-sm text-slate-400">Not provided</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
