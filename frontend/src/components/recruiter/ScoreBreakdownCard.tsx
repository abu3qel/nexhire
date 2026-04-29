"use client";
import { motion } from "framer-motion";
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
      {MODALITIES.map((m, i) => {
        const score = assessment[m.scoreKey];
        const details = assessment[m.detailsKey] as Parameters<typeof m.getDetail>[0];
        const detail = details ? m.getDetail(details) : null;

        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-[#111827] border border-gray-800 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <m.icon className="w-4 h-4 text-[#00d4aa]" />
              </div>
              <span className="text-sm font-medium text-gray-300">{m.label}</span>
            </div>

            {score != null ? (
              <>
                <div className="text-2xl font-bold font-sora text-white mb-2">
                  {Math.round(score * 100)}
                  <span className="text-sm text-gray-500 font-normal">/100</span>
                </div>
                <ScoreBar value={score} size="md" showLabel={false} className="mb-2" />
                {detail && <p className="text-xs text-gray-500 leading-relaxed">{detail}</p>}
              </>
            ) : (
              <div className="text-sm text-gray-600">Not provided</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
