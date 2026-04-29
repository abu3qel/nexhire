"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface ScoreBarProps {
  value: number; // 0-1
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getScoreColor(v: number): string {
  if (v >= 0.7) return "#00d4aa";
  if (v >= 0.4) return "#f59e0b";
  return "#ef4444";
}

export function ScoreBar({ value, showLabel = true, size = "md", className }: ScoreBarProps) {
  const [width, setWidth] = useState(0);
  const pct = Math.round(value * 100);
  const color = getScoreColor(value);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2.5" };

  return (
    <div className={clsx("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color }}>{pct}%</span>
        </div>
      )}
      <div className={clsx("w-full rounded-full bg-gray-700", heights[size])}>
        <motion.div
          className={clsx("rounded-full", heights[size])}
          style={{ backgroundColor: color, width: `${width}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
