"use client";

import { useState } from "react";
import { cn } from "@/shared/lib";
import { ArrayBars, BAR_TONE_CLASS } from "@/entities/array";
import { CodePanel, type SortAlgorithm, type SortOptions } from "@/entities/sort-algorithm";
import { BASE_OPS_PER_SECOND, TrackStatsView, type TrackView } from "@/features/playback";
import type { ArrayItem } from "@/shared/model";
import { structureLabel } from "../model/structures/scene";
import StructureView from "./structure/StructureView";

type Props = {
  views: readonly TrackView[];
  /** 정렬 전 원래 배열 (트리 보기에서 사용) */
  input: readonly ArrayItem[];
  algorithms: readonly SortAlgorithm[];
  /** 슬롯별 정렬 옵션 (구조 보기에서 버킷 수 등을 같은 규칙으로 계산) */
  options: readonly SortOptions[];
  speed: number;
  /** 재생 중인지 (일시정지 상태에서 한 단계씩 넘길 때는 이동 애니메이션을 넉넉하게) */
  playing: boolean;
  /** 비교 모드에서 패널 제목 옆에 붙일 슬롯별 버튼 (예: 슬롯 음소거) */
  renderSlotControls?: (slot: 0 | 1) => React.ReactNode;
};

/** 초당 연산이 이보다 많으면 막대 이동 애니메이션이 따라가지 못하므로 끈다 */
const MAX_ANIMATED_OPS_PER_SECOND = 40;

const SLOT_ACCENT = [
  { chip: "bg-slot-1", border: "border-slot-1/30" },
  { chip: "bg-slot-2", border: "border-slot-2/30" },
];

/** 한 연산 간격이 이보다 짧으면(고배속) 트리 이동 애니메이션 없이 바로 이동 */
const MIN_ANIMATED_INTERVAL_MS = 25;
const MAX_TREE_MOVE_MS = 350;
const STEP_TREE_MOVE_MS = 300;

/** 트리에서 원소가 자리를 옮길 때의 애니메이션 시간: 재생 중에는 연산 간격에 맞추고, 멈춰서 한 단계씩 볼 때는 넉넉하게 */
function treeMoveDuration(speed: number, playing: boolean) {
  if (!playing) return STEP_TREE_MOVE_MS;
  const interval = 1000 / (BASE_OPS_PER_SECOND * speed);
  return interval < MIN_ANIMATED_INTERVAL_MS ? 0 : Math.min(MAX_TREE_MOVE_MS, interval * 0.9);
}

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

export default function VisualizerStage({ views, input, algorithms, options, speed, playing, renderSlotControls }: Props) {
  const compare = views.length > 1;
  const animate = speed * BASE_OPS_PER_SECOND <= MAX_ANIMATED_OPS_PER_SECOND;
  const winner = findWinner(views);
  const moveDurationMs = treeMoveDuration(speed, playing);
  // 코드 패널: 사용자가 정하기 전에는 단일 모드에서 열고 비교 모드에서 닫는다
  const [codeOpen, setCodeOpen] = useState<[boolean | null, boolean | null]>([null, null]);
  // 구조(트리)로 보기: 구조를 지원하는 알고리즘에서만 의미가 있다
  const [structureOn, setStructureOn] = useState<[boolean, boolean]>([false, false]);

  return (
    <div className="flex flex-col gap-3">
      <div className={cn("grid gap-4", compare && "lg:grid-cols-2")}>
        {views.map((view, i) => {
          const algorithm = algorithms[i];
          // 보고 정렬이 한도에 걸려 끝난 경우는 '완료' 색을 칠하지 않는다
          const sortedDone = view.done && !view.truncated;
          const showCode = codeOpen[i] ?? !compare;
          const toggleCode = () =>
            setCodeOpen((prev) => {
              const next: [boolean | null, boolean | null] = [...prev];
              next[i] = !showCode;
              return next;
            });

          const structure = algorithm.structure;
          const showStructure = structure !== undefined && structureOn[i];
          const setShowStructure = (on: boolean) =>
            setStructureOn((prev) => {
              const next: [boolean, boolean] = [...prev];
              next[i] = on;
              return next;
            });

          const bars = (
            <>
              {showStructure ? (
                <StructureView
                  algorithm={{ ...algorithm, structure }}
                  view={view}
                  input={input}
                  options={options[i] ?? {}}
                  moveDurationMs={moveDurationMs}
                  className={cn(compare && "md:h-72")}
                />
              ) : (
                <ArrayBars
                  items={view.items}
                  highlight={view.highlight}
                  done={sortedDone}
                  animate={animate}
                  className={cn(compare && "md:h-72")}
                />
              )}
              <div className="px-4 py-3 md:px-5 border-t border-line bg-subtle">
                <TrackStatsView view={view} winner={winner === i} />
              </div>
            </>
          );
          const code = (
            <CodePanel
              key={algorithm.id}
              algorithm={algorithm}
              activeLine={view.line}
              lineHits={view.lineHits}
              className="bg-surface"
            />
          );

          return (
            <section
              key={i}
              aria-label={`${algorithm.name} 시각화`}
              className={cn(
                "flex flex-col rounded-lg bg-surface border overflow-hidden",
                compare ? SLOT_ACCENT[i].border : "border-line"
              )}
            >
              <header className="flex items-center gap-2 px-4 pt-4 md:px-5">
                {compare && (
                  <span
                    className={cn(
                      "w-5 h-5 rounded-md text-[11px] font-black text-background flex items-center justify-center",
                      SLOT_ACCENT[i].chip
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <h2 className="font-bold text-foreground shrink-0">{algorithm.name}</h2>
                <span className="text-xs text-muted truncate">{algorithm.desc}</span>
                {compare && renderSlotControls?.(i as 0 | 1)}
                {structure && (
                  <div
                    className="ml-auto shrink-0 flex p-0.5 rounded-lg bg-subtle border border-line"
                    role="group"
                    aria-label="보기 방식"
                  >
                    {(
                      [
                        [false, "막대"],
                        [true, structureLabel(structure)],
                      ] as const
                    ).map(([on, label]) => (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={showStructure === on}
                        onClick={() => setShowStructure(on)}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[11px] font-bold transition-all",
                          showStructure === on ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggleCode}
                  aria-expanded={showCode}
                  className={cn(
                    "shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono border transition-all",
                    !structure && "ml-auto",
                    showCode
                      ? "border-foreground bg-foreground text-background"
                      : "border-line text-muted hover:text-foreground hover:bg-subtle"
                  )}
                >
                  {"</>"} 코드
                </button>
              </header>

              {showCode && !compare ? (
                // 단일 모드: 넓은 화면에서 막대 | 코드, 좁은 화면에서는 위아래
                <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <div className="flex flex-col min-w-0">{bars}</div>
                  <div className="relative border-t lg:border-t-0 lg:border-l border-line h-72 lg:h-auto">
                    <div className="lg:absolute lg:inset-0 h-full flex flex-col">{code}</div>
                  </div>
                </div>
              ) : (
                <>
                  {bars}
                  {showCode && <div className="border-t border-line h-72 flex flex-col">{code}</div>}
                </>
              )}
            </section>
          );
        })}
      </div>

      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="막대 색상 범례">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-muted">
            <span className={cn("w-3 h-3 rounded-sm", item.className)} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
