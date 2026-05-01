"use client";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface ScoreBarProps {
  value: number;
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

  const heights = { sm: "h-[3px]", md: "h-[4px]", lg: "h-[5px]" };

  return (
    <div className={clsx("w-full", className)}>
      {showLabel && (
        <div className="text-xs font-mono mb-1.5 font-medium" style={{ color }}>
          {pct}%
        </div>
      )}
      <div className={clsx("w-full rounded-full bg-gray-100", heights[size])}>
        <div
          className={clsx("rounded-full transition-all duration-700 ease-out", heights[size])}
          style={{ backgroundColor: color, width: `${width}%` }}
        />
      </div>
    </div>
  );
}
