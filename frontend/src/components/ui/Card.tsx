import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("rounded-xl bg-white border border-slate-200 shadow-sm p-5", className)}>
      {children}
    </div>
  );
}
