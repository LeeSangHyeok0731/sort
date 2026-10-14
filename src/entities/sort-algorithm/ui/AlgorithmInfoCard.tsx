import { cn } from "@/shared/lib";
import type { SortAlgorithm } from "../model/types";

type Props = {
  algorithm: SortAlgorithm;
  accent?: "indigo" | "pink";
  className?: string;
};

const ACCENT = {
  indigo: "text-indigo-300",
  pink: "text-pink-300",
} as const;

export default function AlgorithmInfoCard({ algorithm, accent = "indigo", className }: Props) {
  const { complexity } = algorithm;
  const rows: Array<[string, string]> = [
    ["최선", complexity.best],
    ["평균", complexity.average],
    ["최악", complexity.worst],
    ["공간", complexity.space],
  ];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={cn("font-bold", ACCENT[accent])}>{algorithm.name}</h3>
          <p className="text-xs text-white/45 mt-0.5">{algorithm.desc}</p>
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border",
            algorithm.stable
              ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
              : "text-white/40 bg-white/5 border-white/10"
          )}
          title="안정 정렬: 같은 값의 원래 순서가 유지됨"
        >
          {algorithm.stable ? "안정 정렬" : "불안정 정렬"}
        </span>
      </div>
      <dl className="grid grid-cols-4 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 rounded-lg bg-black/20 px-2 py-1.5">
            <dt className="text-[10px] text-white/30">{label}</dt>
            <dd className="text-xs font-mono text-white/80 break-words">{value}</dd>
          </div>
        ))}
      </dl>
      {algorithm.note && (
        <p className="text-[11px] leading-relaxed text-amber-200/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          ⚠️ {algorithm.note}
        </p>
      )}
    </div>
  );
}
