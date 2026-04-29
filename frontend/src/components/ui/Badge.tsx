import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "teal" | "amber" | "red" | "green" | "gray";
  pulse?: boolean;
  className?: string;
}

const variants = {
  teal: "bg-teal-500/10 text-[#00d4aa] border border-teal-500/30",
  amber: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  red: "bg-red-500/10 text-red-400 border border-red-500/30",
  green: "bg-green-500/10 text-green-400 border border-green-500/30",
  gray: "bg-gray-700/50 text-gray-400 border border-gray-600/30",
};

export function Badge({ children, variant = "gray", pulse = false, className }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", variants[variant], className)}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: variant === "amber" ? "#f59e0b" : variant === "teal" ? "#00d4aa" : "#9ca3af" }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5"
            style={{ backgroundColor: variant === "amber" ? "#f59e0b" : variant === "teal" ? "#00d4aa" : "#9ca3af" }} />
        </span>
      )}
      {children}
    </span>
  );
}
