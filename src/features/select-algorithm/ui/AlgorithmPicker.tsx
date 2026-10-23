"use client";

import { useState } from "react";
import { cn } from "@/shared/lib";
import {
  ALGORITHMS,
  CATEGORIES,
  getAlgorithm,
  searchAlgorithms,
  type AlgorithmCategory,
  type AlgorithmId,
} from "@/entities/sort-algorithm";

const CATEGORY_NAME = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name])) as Record<
  AlgorithmCategory,
  string
>;

export type Slot = 0 | 1;

type Props = {
  compareMode: boolean;
  onCompareModeChange: (value: boolean) => void;
  selected: readonly [AlgorithmId, AlgorithmId];
  onSelect: (slot: Slot, id: AlgorithmId) => void;
  disabled?: boolean;
};

const SLOT_STYLE = {
  0: { chip: "bg-slot-1 text-white", ring: "border-slot-1 bg-blue-50 text-slot-1" },
  1: { chip: "bg-slot-2 text-white", ring: "border-slot-2 bg-violet-50 text-slot-2" },
} as const;

export default function AlgorithmPicker({ compareMode, onCompareModeChange, selected, onSelect, disabled }: Props) {
  const [activeSlot, setActiveSlot] = useState<Slot>(0);
  const slot: Slot = compareMode ? activeSlot : 0;
  const [category, setCategory] = useState<AlgorithmCategory>(() => getAlgorithm(selected[0]).category);

  const [query, setQuery] = useState("");
  const searching = query.trim() !== "";
  const visible = searching ? searchAlgorithms(query) : ALGORITHMS.filter((a) => a.category === category);

  const switchSlot = (next: Slot) => {
    setActiveSlot(next);
    setCategory(getAlgorithm(selected[next]).category);
  };

  return (
    <section className="flex flex-col gap-5" aria-label="알고리즘 선택">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground font-bold text-lg">알고리즘</h2>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <span className="text-sm text-muted">비교 모드</span>
          <button
            type="button"
            role="switch"
            aria-checked={compareMode}
            disabled={disabled}
            onClick={() => onCompareModeChange(!compareMode)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40",
              compareMode ? "bg-foreground" : "bg-gray-400"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                compareMode ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </label>
      </div>

      {compareMode && (
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="편집할 슬롯">
          {([0, 1] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={slot === s}
              onClick={() => switchSlot(s)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all",
                slot === s ? SLOT_STYLE[s].ring : "border-line text-muted hover:bg-subtle"
              )}
            >
              <span className={cn("w-5 h-5 shrink-0 rounded-md text-[11px] font-black flex items-center justify-center", SLOT_STYLE[s].chip)}>
                {s + 1}
              </span>
              <span className="text-sm font-bold truncate">{getAlgorithm(selected[s]).name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
          placeholder={`알고리즘 검색 (${ALGORITHMS.length}종) — 예: 퀵, 힙, 보고`}
          aria-label="알고리즘 검색"
          className="w-full bg-surface border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:border-foreground"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>

      {searching ? (
        <p className="text-xs text-muted -mb-2" aria-live="polite">
          검색 결과 {visible.length}개
        </p>
      ) : (
        <div className="flex gap-1 p-1 bg-subtle border border-line rounded-lg overflow-x-auto no-scrollbar" role="tablist" aria-label="분류">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "flex-1 px-3 py-2 rounded-md text-xs md:text-sm font-bold whitespace-nowrap transition-all",
                category === c.id ? "bg-foreground text-white" : "text-muted hover:text-foreground"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {searching && visible.length === 0 && (
        <p className="text-sm text-muted text-center py-6">
          &ldquo;{query.trim()}&rdquo;에 맞는 알고리즘이 없어요.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visible.map((algo) => {
          const isActive = selected[slot] === algo.id;
          const otherSlot: Slot = slot === 0 ? 1 : 0;
          const isOther = compareMode && selected[otherSlot] === algo.id;
          return (
            <button
              key={algo.id}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onSelect(slot, algo.id)}
              className={cn(
                "relative flex flex-col items-start gap-1 px-3 py-3 rounded-lg border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                isActive
                  ? SLOT_STYLE[slot].ring
                  : "border-line bg-surface text-gray-700 hover:bg-subtle hover:text-foreground"
              )}
            >
              {searching && (
                <span className="text-[10px] font-bold text-muted">{CATEGORY_NAME[algo.category]}</span>
              )}
              <span className="text-sm font-bold leading-tight">{algo.name}</span>
              <span className="text-[11px] leading-snug text-muted">{algo.desc}</span>
              {isOther && (
                <span
                  className={cn(
                    "absolute top-2 right-2 w-4 h-4 rounded text-[10px] font-black flex items-center justify-center",
                    SLOT_STYLE[otherSlot].chip
                  )}
                  title={`${otherSlot + 1}번 슬롯에서 선택됨`}
                >
                  {otherSlot + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
