import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "teal" | "amber" | "red" | "green" | "gray";
  pulse?: boolean;
  className?: string;
}

const variants = {
  blue:  "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
  teal:  "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
  amber: "bg-amber-50 text-amber-700 border border-amber-200/80",
  red:   "bg-red-50 text-red-600 border border-red-200/80",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
  gray:  "bg-gray-100 text-gray-600 border border-gray-200/80",
};

const dotColors: Record<string, string> = {
  blue: "#4F46E5", teal: "#4F46E5", amber: "#D97706",
  red: "#DC2626", green: "#059669", gray: "#9CA3AF",
};

export function Badge({ children, variant = "gray", pulse = false, className }: BadgeProps) {
  const dot = dotColors[variant] ?? "#9CA3AF";
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md",
      variants[variant],
      className
    )}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ backgroundColor: dot }}
          />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: dot }} />
        </span>
      )}
      {children}
    </span>
  );
}
