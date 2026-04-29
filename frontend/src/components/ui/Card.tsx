import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-[#111827] border border-gray-800 p-5",
        glow && "border-teal-500/30 shadow-lg shadow-teal-500/5",
        className
      )}
    >
      {children}
    </div>
  );
}
