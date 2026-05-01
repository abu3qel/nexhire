import { clsx } from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 font-semibold shadow-sm shadow-brand-600/20",
  secondary:
    "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 font-medium hover:border-gray-300",
  ghost:
    "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 font-semibold shadow-sm",
};

const sizes = {
  sm:  "text-xs px-2.5 py-1.5 rounded-md gap-1.5",
  md:  "text-sm px-3.5 py-2 rounded-lg gap-2",
  lg:  "text-sm px-5 py-2.5 rounded-lg gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
