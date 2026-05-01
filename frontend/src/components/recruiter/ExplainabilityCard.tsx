"use client";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AssessmentExplanation, ModalityWeights } from "@/lib/types";
import { Card } from "@/components/ui/Card";

interface Props {
  explanation: AssessmentExplanation;
  confidenceScores?: Partial<Record<keyof ModalityWeights, number>>;
}

const MODALITY_LABELS: Record<string, string> = {
  resume: "Resume",
  cover_letter: "Cover Letter",
  github: "GitHub",
  stackoverflow: "Stack Overflow",
  portfolio: "Portfolio",
};

function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls =
    pct >= 70
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : pct >= 40
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${cls}`}>
      {pct}%
    </span>
  );
}

export function ExplainabilityCard({ explanation, confidenceScores }: Props) {
  const delta = explanation.fusion_delta_vs_baseline;
  const DeltaIcon = delta > 0.04 ? TrendingUp : delta < -0.04 ? TrendingDown : Minus;
  const deltaColor = delta > 0.04 ? "text-emerald-600" : delta < -0.04 ? "text-red-500" : "text-gray-400";

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-brand-500 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-gray-900">Score Explainability</h3>
      </div>

      {/* Summary sentence */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{explanation.summary}</p>

      {/* Confidence note */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${
          explanation.avg_confidence >= 0.7
            ? "bg-emerald-50 text-emerald-700"
            : explanation.avg_confidence >= 0.4
            ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-600"
        }`}>
          {explanation.confidence_note}
        </span>
        <span className="text-xs text-gray-400">
          {explanation.modalities_available} modality{explanation.modalities_available !== 1 ? "s" : ""} evaluated
        </span>
      </div>

      {/* Modality contributions table */}
      <div className="space-y-2.5">
        {Object.entries(explanation.modality_contributions)
          .sort(([, a], [, b]) => b.effective_weight_pct - a.effective_weight_pct)
          .map(([modality, contrib]) => (
            <div key={modality} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24 flex-shrink-0 truncate">
                {MODALITY_LABELS[modality] || modality}
                {modality === explanation.primary_driver && (
                  <span className="ml-1 text-brand-500">★</span>
                )}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${Math.round(contrib.score * 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-8 text-right flex-shrink-0">
                {Math.round(contrib.score * 100)}
              </span>
              <span className="text-xs text-gray-400 w-12 text-right flex-shrink-0">
                {contrib.effective_weight_pct.toFixed(0)}% wt
              </span>
              {confidenceScores?.[modality as keyof ModalityWeights] != null && (
                <ConfidencePill value={confidenceScores[modality as keyof ModalityWeights]!} />
              )}
            </div>
          ))}
      </div>

      {/* Fusion delta */}
      <div className={`flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-100 text-xs font-medium ${deltaColor}`}>
        <DeltaIcon className="w-3.5 h-3.5" />
        <span>
          Fusion{" "}
          {delta > 0.04
            ? `+${Math.round(delta * 100)} pts vs resume-only`
            : delta < -0.04
            ? `${Math.round(delta * 100)} pts vs resume-only`
            : "matches resume-only baseline"}
        </span>
      </div>
    </Card>
  );
}
