"use client";
import { motion } from "framer-motion";
import { RankedCandidate } from "@/lib/types";

interface Props {
  candidates: RankedCandidate[];
}

export function BaselineComparison({ candidates }: Props) {
  const completed = candidates.filter(c => c.composite_score != null && c.baseline_score != null);

  if (completed.length === 0) {
    return <div className="text-center py-12 text-gray-500 text-sm">No completed assessments to compare</div>;
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        Comparing composite multi-modal rank vs. resume-only baseline rank. Teal = candidate improved; Amber = candidate dropped.
      </p>
      <div className="space-y-3">
        {completed.map((c, i) => {
          const changed = c.rank_change;
          const improved = changed != null && changed > 1;
          const dropped = changed != null && changed < -1;
          const color = improved ? "border-teal-500/30 bg-teal-500/5" : dropped ? "border-amber-500/30 bg-amber-500/5" : "border-gray-700";

          return (
            <motion.div
              key={c.application_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border p-4 ${color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{c.candidate_name}</div>
                  <div className="text-xs text-gray-500">{c.candidate_email}</div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Resume-only</div>
                    <div className="font-mono font-bold text-white">#{c.baseline_rank}</div>
                  </div>
                  <div className="text-gray-600">→</div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Multi-modal</div>
                    <div className={`font-mono font-bold ${improved ? "text-[#00d4aa]" : dropped ? "text-amber-400" : "text-white"}`}>
                      #{c.rank}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Change</div>
                    <div className={`font-mono font-bold text-sm ${improved ? "text-[#00d4aa]" : dropped ? "text-amber-400" : "text-gray-400"}`}>
                      {changed != null ? (changed > 0 ? `↑${changed}` : changed < 0 ? `↓${Math.abs(changed)}` : "—") : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
