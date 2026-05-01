"use client";
import { FileText, Github, MessageSquare, Globe, Award } from "lucide-react";
import { Assessment, Application, AssessmentStatus } from "@/lib/types";
import { ScoreBar } from "@/components/ui/ScoreBar";

interface Props {
  assessment: Assessment;
  application?: Application;
  assessmentStatus?: AssessmentStatus;
}

const MODALITIES = [
  {
    key: "resume" as const,
    appKey: "resume_path" as keyof Application,
    icon: FileText,
    label: "Resume",
    scoreKey: "resume_score" as const,
    detailsKey: "resume_details" as const,
    confidenceKey: "resume" as const,
    getDetail: (d: Assessment["resume_details"]) =>
      d ? `${d.extracted_skills?.slice(0, 4).join(", ")} · ${d.education?.[0]?.degree || ""}` : null,
  },
  {
    key: "cover_letter" as const,
    appKey: "cover_letter_path" as keyof Application,
    icon: MessageSquare,
    label: "Cover Letter",
    scoreKey: "cover_letter_score" as const,
    detailsKey: "cover_letter_details" as const,
    confidenceKey: "cover_letter" as const,
    getDetail: (d: Assessment["cover_letter_details"]) =>
      d ? `Clarity: ${Math.round((d.clarity_score || 0) * 100)}% · Motivation: ${Math.round((d.motivation_score || 0) * 100)}%` : null,
  },
  {
    key: "github" as const,
    appKey: "github_url" as keyof Application,
    icon: Github,
    label: "GitHub",
    scoreKey: "github_score" as const,
    detailsKey: "github_details" as const,
    confidenceKey: "github" as const,
    getDetail: (d: Assessment["github_details"]) =>
      d ? `${d.repo_count} repos · ${d.total_commits} commits · ${Object.keys(d.top_languages || {}).slice(0, 3).join(", ")}` : null,
  },
  {
    key: "stackoverflow" as const,
    appKey: "stackoverflow_url" as keyof Application,
    icon: Award,
    label: "Stack Overflow",
    scoreKey: "stackoverflow_score" as const,
    detailsKey: "stackoverflow_details" as const,
    confidenceKey: "stackoverflow" as const,
    getDetail: (d: Assessment["stackoverflow_details"]) =>
      d ? `Reputation: ${d.reputation?.toLocaleString()} · ${d.answer_count} answers` : null,
  },
  {
    key: "portfolio" as const,
    appKey: "portfolio_url" as keyof Application,
    icon: Globe,
    label: "Portfolio",
    scoreKey: "portfolio_score" as const,
    detailsKey: "portfolio_details" as const,
    confidenceKey: "portfolio" as const,
    getDetail: (d: Assessment["portfolio_details"]) =>
      d ? `${d.projects_found} projects · ${d.technologies?.slice(0, 3).join(", ")}` : null,
  },
];

function confidenceColor(c: number): string {
  if (c >= 0.7) return "text-emerald-600 bg-emerald-50";
  if (c >= 0.4) return "text-amber-600 bg-amber-50";
  return "text-red-500 bg-red-50";
}

export function ScoreBreakdownCard({ assessment, application, assessmentStatus }: Props) {
  const isPending = assessmentStatus === "pending" || assessmentStatus === "processing";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {MODALITIES.map((m) => {
        const score = assessment[m.scoreKey];
        const details = assessment[m.detailsKey];
        const confidence = assessment.confidence_scores?.[m.confidenceKey];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detail = details ? (m.getDetail as (d: unknown) => string | null)(details) : null;
        const wasSubmitted = application ? !!application[m.appKey] : undefined;

        return (
          <div key={m.key} className="rounded-xl bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <m.icon className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{m.label}</span>
              </div>
              {confidence != null && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${confidenceColor(confidence)}`}>
                  {Math.round(confidence * 100)}% conf
                </span>
              )}
            </div>

            {score != null ? (
              <>
                <div className="text-2xl font-bold text-gray-900 font-mono mb-2">
                  {Math.round(score * 100)}
                  <span className="text-sm text-gray-400 font-normal"> /100</span>
                </div>
                <ScoreBar value={score} size="md" showLabel={false} className="mb-2" />
                {detail && <p className="text-xs text-gray-500 leading-relaxed mt-1">{detail}</p>}
              </>
            ) : isPending && wasSubmitted !== false ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-sm text-brand-500">Processing...</span>
              </div>
            ) : wasSubmitted === false ? (
              <div className="text-sm text-gray-400">Not submitted</div>
            ) : (
              <div className="text-sm text-gray-400">Not provided</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
