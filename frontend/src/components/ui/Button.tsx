import { clsx } from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-[#00d4aa] text-[#0a0f1e] hover:bg-[#00b894] font-semibold",
  secondary: "bg-[#1f2937] text-gray-100 hover:bg-[#374151] border border-gray-700",
  ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-[#1f2937]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2 rounded-xl",
  lg: "text-base px-6 py-3 rounded-xl",
};

export function Button({ variant = "primary", size = "md", loading, children, disabled, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
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
