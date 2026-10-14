"use client";

import { cn } from "@/shared/lib";
import { ArrayBars, BAR_TONE_CLASS } from "@/entities/array";
import type { SortAlgorithm } from "@/entities/sort-algorithm";
import { BASE_OPS_PER_SECOND, TrackStatsView, type TrackView } from "@/features/playback";

type Props = {
  views: readonly TrackView[];
  algorithms: readonly SortAlgorithm[];
  speed: number;
};

/** 초당 연산이 이보다 많으면 막대 이동 애니메이션이 따라가지 못하므로 끈다 */
const MAX_ANIMATED_OPS_PER_SECOND = 40;

const SLOT_ACCENT = [
  { chip: "bg-indigo-500", border: "border-indigo-500/20" },
  { chip: "bg-pink-500", border: "border-pink-500/20" },
];

const LEGEND = [
  { label: "비교", className: BAR_TONE_CLASS.compare },
  { label: "교환·이동", className: BAR_TONE_CLASS.change },
  { label: "읽기", className: BAR_TONE_CLASS.read },
  { label: "완료", className: BAR_TONE_CLASS.done },
];

/** 비교 모드에서 연산 수가 더 적어 먼저 끝난 트랙 (동점이면 없음) */
function findWinner(views: readonly TrackView[]): number | null {
  if (views.length < 2) return null;
  const [a, b] = views;
  if (a.total === null || b.total === null || a.total === b.total) return null;
  const winner = a.total < b.total ? 0 : 1;
  return views[winner].done ? winner : null;
}

export default function VisualizerStage({ views, algorithms, speed }: Props) {
  const compare = views.length > 1;
  const animate = speed * BASE_OPS_PER_SECOND <= MAX_ANIMATED_OPS_PER_SECOND;
  const winner = findWinner(views);

  return (
    <div className="flex flex-col gap-3">
      <div className={cn("grid gap-4", compare && "lg:grid-cols-2")}>
        {views.map((view, i) => {
          const algorithm = algorithms[i];
          // 보고 정렬이 한도에 걸려 끝난 경우는 '완료' 색을 칠하지 않는다
          const sortedDone = view.done && !view.truncated;
          return (
            <section
              key={i}
              aria-label={`${algorithm.name} 시각화`}
              className={cn(
                "flex flex-col rounded-3xl bg-white/[0.04] border backdrop-blur-sm overflow-hidden",
                compare ? SLOT_ACCENT[i].border : "border-white/10"
              )}
            >
              <header className="flex items-center gap-2 px-4 pt-4 md:px-5">
                {compare && (
                  <span
                    className={cn(
                      "w-5 h-5 rounded-md text-[11px] font-black text-white flex items-center justify-center",
                      SLOT_ACCENT[i].chip
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <h2 className="font-bold text-white">{algorithm.name}</h2>
                <span className="text-xs text-white/35 truncate">{algorithm.desc}</span>
              </header>
              <ArrayBars
                items={view.items}
                highlight={view.highlight}
                done={sortedDone}
                animate={animate}
                className={cn(compare && "md:h-72")}
              />
              <div className="px-4 py-3 md:px-5 border-t border-white/5 bg-black/10">
                <TrackStatsView view={view} winner={winner === i} />
              </div>
            </section>
          );
        })}
      </div>

      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="막대 색상 범례">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-white/45">
            <span className={cn("w-3 h-3 rounded-sm", item.className)} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
