import { clsx } from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm font-medium",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm font-medium",
  ghost: "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm font-medium",
};

const sizes = {
  sm: "text-xs px-3 py-1.5 rounded-md",
  md: "text-sm px-4 py-2 rounded-lg",
  lg: "text-sm px-5 py-2.5 rounded-lg",
};

export function Button({ variant = "primary", size = "md", loading, children, disabled, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center gap-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
