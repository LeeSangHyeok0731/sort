import { cn } from "@/shared/lib";
import type { SortAlgorithm } from "../model/types";

type Props = {
  algorithm: SortAlgorithm;
  /** 비교 모드 슬롯 (제목 색) */
  slot?: 0 | 1;
  className?: string;
};

const SLOT_TEXT = ["text-slot-1", "text-slot-2"] as const;

export default function AlgorithmInfoCard({ algorithm, slot = 0, className }: Props) {
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
          <h3 className={cn("font-bold", SLOT_TEXT[slot])}>{algorithm.name}</h3>
          <p className="text-xs text-muted mt-0.5">{algorithm.desc}</p>
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border",
            algorithm.stable
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-muted bg-subtle border-line"
          )}
          title="안정 정렬: 같은 값의 원래 순서가 유지됨"
        >
          {algorithm.stable ? "안정 정렬" : "불안정 정렬"}
        </span>
      </div>
      <dl className="grid grid-cols-4 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 rounded-lg bg-subtle border border-line px-2 py-1.5">
            <dt className="text-[10px] text-muted">{label}</dt>
            <dd className="text-xs font-mono text-foreground break-words">{value}</dd>
          </div>
        ))}
      </dl>
      {algorithm.note && (
        <p className="text-[11px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚠️ {algorithm.note}
        </p>
      )}
    </div>
  );
}
