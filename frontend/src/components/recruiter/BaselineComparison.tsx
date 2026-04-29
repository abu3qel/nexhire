"use client";
import { RankedCandidate } from "@/lib/types";

interface Props {
  candidates: RankedCandidate[];
}

export function BaselineComparison({ candidates }: Props) {
  const completed = candidates.filter(c => c.composite_score != null && c.baseline_score != null);

  if (completed.length === 0) {
    return <div className="text-center py-12 text-slate-400 text-sm">No completed assessments to compare</div>;
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4">
        Comparing composite multi-modal rank vs. resume-only baseline rank.
        <span className="text-emerald-600 font-medium"> Green</span> = improved with multi-modal signals;
        <span className="text-amber-600 font-medium"> Amber</span> = dropped.
      </p>
      <div className="space-y-2">
        {completed.map((c) => {
          const changed = c.rank_change;
          const improved = changed != null && changed > 1;
          const dropped = changed != null && changed < -1;

          return (
            <div
              key={c.application_id}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                improved ? "border-emerald-200 bg-emerald-50"
                : dropped ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <div className="font-medium text-slate-900 text-sm">{c.candidate_name}</div>
                <div className="text-xs text-slate-400">{c.candidate_email}</div>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-0.5">Resume-only</div>
                  <div className="font-mono font-bold text-slate-700">#{c.baseline_rank}</div>
                </div>
                <div className="text-slate-300">→</div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-0.5">Multi-modal</div>
                  <div className={`font-mono font-bold ${improved ? "text-emerald-600" : dropped ? "text-amber-600" : "text-slate-700"}`}>
                    #{c.rank}
                  </div>
                </div>
                <div className="text-center min-w-[40px]">
                  <div className="text-xs text-slate-500 mb-0.5">Change</div>
                  <div className={`font-mono font-bold text-sm ${improved ? "text-emerald-600" : dropped ? "text-amber-600" : "text-slate-400"}`}>
                    {changed != null
                      ? (changed > 0 ? `↑${changed}` : changed < 0 ? `↓${Math.abs(changed)}` : "—")
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
