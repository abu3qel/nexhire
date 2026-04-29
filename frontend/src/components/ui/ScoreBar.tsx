"use client";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface ScoreBarProps {
  value: number; // 0-1
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getColor(v: number) {
  if (v >= 0.7) return "#059669";
  if (v >= 0.4) return "#D97706";
  return "#DC2626";
}

export function ScoreBar({ value, showLabel = true, size = "md", className }: ScoreBarProps) {
  const [width, setWidth] = useState(0);
  const pct = Math.round(value * 100);
  const color = getColor(value);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  const h = { sm: "h-1", md: "h-1.5", lg: "h-2" };

  return (
    <div className={clsx("w-full", className)}>
      {showLabel && (
        <div className="text-xs mb-1" style={{ color }}>{pct}%</div>
      )}
      <div className={clsx("w-full rounded-full bg-slate-100", h[size])}>
        <div
          className={clsx("rounded-full transition-all duration-700 ease-out", h[size])}
          style={{ backgroundColor: color, width: `${width}%` }}
        />
      </div>
    </div>
  );
}
