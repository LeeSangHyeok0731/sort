import { cn } from "@/shared/lib";
import type { TrackView } from "../model/useSortPlayer";

type Props = {
  view: TrackView;
  /** 비교 모드에서 먼저 끝난 쪽 */
  winner?: boolean;
};

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className={cn("font-mono font-black text-sm md:text-base tabular-nums", className)}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export default function TrackStatsView({ view, winner }: Props) {
  const { stats, cursor, total, done, truncated } = view;
  const percent = total ? Math.round((cursor / total) * 100) : done ? 100 : 0;

  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
      <Stat label="비교" value={stats.compares} className="text-amber-700" />
      <Stat label="교환" value={stats.swaps} className="text-red-600" />
      {stats.moves > 0 && <Stat label="이동" value={stats.moves} className="text-red-600" />}
      {stats.reads > 0 && <Stat label="읽기" value={stats.reads} className="text-sky-700" />}
      <div className="ml-auto flex items-center gap-2">
        {truncated && done && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            한도 도달 · 미완료
          </span>
        )}
        {winner && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            🏆 먼저 완료
          </span>
        )}
        <span className="text-xs font-mono text-muted tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}
