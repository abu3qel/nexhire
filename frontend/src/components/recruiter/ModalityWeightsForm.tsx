"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { jobsApi } from "@/lib/api";
import { ModalityWeights } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface Props {
  jobId: string;
  currentWeights: ModalityWeights;
  onClose: () => void;
}

const KEYS: { key: keyof ModalityWeights; label: string }[] = [
  { key: "resume",        label: "Resume" },
  { key: "cover_letter",  label: "Cover Letter" },
  { key: "github",        label: "GitHub" },
  { key: "stackoverflow", label: "Stack Overflow" },
  { key: "portfolio",     label: "Portfolio" },
];

export function ModalityWeightsForm({ jobId, currentWeights, onClose }: Props) {
  const qc = useQueryClient();
  const [weights, setWeights] = useState({ ...currentWeights });
  const [loading, setLoading] = useState(false);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const valid = Math.abs(total - 1.0) < 0.01;

  const set = (key: keyof ModalityWeights, val: number) =>
    setWeights(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    if (!valid) { toast.error("Weights must sum to 1.0"); return; }
    setLoading(true);
    try {
      await jobsApi.updateWeights(jobId, weights);
      await qc.invalidateQueries({ queryKey: ["job", jobId] });
      toast.success("Weights updated");
      onClose();
    } catch {
      toast.error("Failed to update weights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900">Modality Weights</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${valid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          Total: {(total * 100).toFixed(0)}%
        </span>
      </div>

      <div className="space-y-4 mb-5">
        {KEYS.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <span className="text-sm font-semibold text-brand-600">{Math.round(weights[key] * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={weights[key]}
              onChange={e => set(key, parseFloat(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" loading={loading} onClick={save} disabled={!valid}>Save Weights</Button>
      </div>
    </div>
  );
}
