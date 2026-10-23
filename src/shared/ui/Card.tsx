import { cn } from "@/shared/lib";

export default function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface border border-line p-5 md:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
