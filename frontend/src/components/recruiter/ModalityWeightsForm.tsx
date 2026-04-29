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
  { key: "resume", label: "Resume" },
  { key: "cover_letter", label: "Cover Letter" },
  { key: "github", label: "GitHub" },
  { key: "stackoverflow", label: "Stack Overflow" },
  { key: "portfolio", label: "Portfolio" },
];

export function ModalityWeightsForm({ jobId, currentWeights, onClose }: Props) {
  const qc = useQueryClient();
  const [weights, setWeights] = useState({ ...currentWeights });
  const [loading, setLoading] = useState(false);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const valid = Math.abs(total - 1.0) < 0.01;

  const set = (key: keyof ModalityWeights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sora font-semibold text-white">Modality Weights</h3>
        <span className={`text-sm font-mono px-2 py-0.5 rounded-lg ${valid ? "text-[#00d4aa] bg-teal-500/10" : "text-red-400 bg-red-500/10"}`}>
          Total: {(total * 100).toFixed(0)}%
        </span>
      </div>

      <div className="space-y-4 mb-4">
        {KEYS.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <label className="text-sm text-gray-300">{label}</label>
              <span className="text-sm font-mono text-[#00d4aa]">{Math.round(weights[key] * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={weights[key]}
              onChange={e => set(key, parseFloat(e.target.value))}
              className="w-full accent-teal-500"
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
