import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "teal" | "amber" | "red" | "green" | "gray";
  pulse?: boolean;
  className?: string;
}

const variants = {
  blue:  "bg-blue-50 text-blue-700 border border-blue-200",
  teal:  "bg-blue-50 text-blue-700 border border-blue-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  red:   "bg-red-50 text-red-700 border border-red-200",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  gray:  "bg-slate-100 text-slate-600 border border-slate-200",
};

const dotColors: Record<string, string> = {
  blue: "#2563EB", teal: "#2563EB", amber: "#D97706",
  red: "#DC2626", green: "#059669", gray: "#94A3B8",
};

export function Badge({ children, variant = "gray", pulse = false, className }: BadgeProps) {
  const dot = dotColors[variant] ?? "#94A3B8";
  return (
    <span className={clsx("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md", variants[variant], className)}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: dot }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: dot }} />
        </span>
      )}
      {children}
    </span>
  );
}
