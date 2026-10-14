import { cn } from "@/shared/lib";

export default function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-2xl p-5 md:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
