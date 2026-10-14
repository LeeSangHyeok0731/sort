"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { ArrayItem } from "@/shared/model";
import { cn } from "@/shared/lib";
import CanvasBars from "./CanvasBars";

export type BarTone = "compare" | "change" | "read";

export type BarHighlight = { tone: BarTone; indices: readonly number[] } | null;

/** 막대 색상. 범례(Legend)와 공유한다. */
export const BAR_TONE_CLASS: Record<BarTone | "idle" | "done", string> = {
  idle: "bg-linear-to-t from-indigo-600 to-indigo-400",
  compare: "bg-linear-to-t from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
  change: "bg-linear-to-t from-rose-500 to-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.5)]",
  read: "bg-linear-to-t from-sky-500 to-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.5)]",
  done: "bg-linear-to-t from-emerald-600 to-emerald-400",
};

type Props = {
  items: readonly ArrayItem[];
  highlight?: BarHighlight;
  /** 정렬 완료 상태 (초록색 물결 효과) */
  done?: boolean;
  /** 막대 이동 애니메이션 사용 여부 (고배속·대용량에서는 끈다) */
  animate?: boolean;
  className?: string;
};

const LABEL_MAX_ITEMS = 30;
/** 이보다 많으면 canvas로 그린다 (DOM 막대는 느림) */
const DOM_MAX_ITEMS = 100;

function ArrayBars({ items, highlight, done = false, animate = true, className }: Props) {
  const maxValue = Math.max(1, ...items.map((i) => i.value));
  const n = items.length;
  const showLabels = n <= LABEL_MAX_ITEMS;
  // 완료 물결은 막대 수와 상관없이 약 0.6초 안에 끝나도록
  const sweepDelay = n > 0 ? 600 / n : 0;

  if (n > DOM_MAX_ITEMS) {
    return (
      <div
        role="img"
        aria-label={`막대 ${n}개${done ? ", 정렬 완료" : ""}`}
        className={cn("w-full h-64 md:h-80 px-3 pt-3 md:px-5 md:pt-5", className)}
      >
        <CanvasBars items={items} highlight={highlight} done={done} />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`막대 ${n}개${done ? ", 정렬 완료" : ""}`}
      className={cn(
        "flex items-end w-full h-64 md:h-80 px-3 pt-3 md:px-5 md:pt-5 pb-0",
        n > 50 ? "gap-px" : "gap-1",
        className
      )}
    >
      {items.map((item, index) => {
        const tone = highlight?.indices.includes(index) ? highlight.tone : null;
        const colorClass = tone ? BAR_TONE_CLASS[tone] : done ? BAR_TONE_CLASS.done : BAR_TONE_CLASS.idle;
        const Bar = animate ? motion.div : "div";
        return (
          <Bar
            key={item.id}
            {...(animate
              ? { layout: true, transition: { type: "spring", stiffness: 500, damping: 40 } }
              : {})}
            className={cn(
              "relative flex-1 min-w-0 transition-colors duration-200",
              "rounded-t-md",
              tone ? "z-10 opacity-100" : "opacity-85",
              colorClass
            )}
            style={{
              height: `${Math.max(1.5, (item.value / maxValue) * 100)}%`,
              transitionDelay: done && !tone ? `${index * sweepDelay}ms` : "0ms",
            }}
          >
            {showLabels && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/40 select-none">
                {item.value}
              </span>
            )}
          </Bar>
        );
      })}
    </div>
  );
}

export default memo(ArrayBars);
