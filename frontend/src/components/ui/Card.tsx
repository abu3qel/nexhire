import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("rounded-xl bg-white border border-gray-200 p-5", className)}>
      {children}
    </div>
  );
}
