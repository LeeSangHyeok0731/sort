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
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{label}</span>
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
      <Stat label="비교" value={stats.compares} className="text-amber-300" />
      <Stat label="교환" value={stats.swaps} className="text-rose-300" />
      {stats.moves > 0 && <Stat label="이동" value={stats.moves} className="text-rose-300" />}
      {stats.reads > 0 && <Stat label="읽기" value={stats.reads} className="text-sky-300" />}
      <div className="ml-auto flex items-center gap-2">
        {truncated && done && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
            한도 도달 · 미완료
          </span>
        )}
        {winner && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            🏆 먼저 완료
          </span>
        )}
        <span className="text-xs font-mono text-white/40 tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}
