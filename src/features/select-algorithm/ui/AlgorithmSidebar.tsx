"use client";

import { useState } from "react";
import { cn } from "@/shared/lib";
import {
  ALGORITHMS,
  FAMILIES,
  getAlgorithm,
  getFamily,
  searchAlgorithms,
  type AlgorithmFamily,
  type AlgorithmId,
} from "@/entities/sort-algorithm";

export type Slot = 0 | 1;

type Props = {
  compareMode: boolean;
  onCompareModeChange: (value: boolean) => void;
  selected: readonly [AlgorithmId, AlgorithmId];
  onSelect: (slot: Slot, id: AlgorithmId) => void;
  disabled?: boolean;
};

const SLOT_STYLE = {
  0: { chip: "bg-slot-1 text-background", ring: "border-slot-1 bg-blue-50 dark:bg-blue-500/15 text-slot-1" },
  1: { chip: "bg-slot-2 text-background", ring: "border-slot-2 bg-violet-50 dark:bg-violet-500/15 text-slot-2" },
} as const;

/** 알고리즘을 계열별 폴더 트리로 보여주는 선택 사이드바 */
export default function AlgorithmSidebar({ compareMode, onCompareModeChange, selected, onSelect, disabled }: Props) {
  const [activeSlot, setActiveSlot] = useState<Slot>(0);
  const slot: Slot = compareMode ? activeSlot : 0;
  const otherSlot: Slot = slot === 0 ? 1 : 0;

  // 처음에는 선택된 알고리즘이 든 폴더만 펼친다
  const [open, setOpen] = useState<ReadonlySet<AlgorithmFamily>>(
    () => new Set((compareMode ? selected : selected.slice(0, 1)).map(getFamily))
  );

  const [query, setQuery] = useState("");
  const searching = query.trim() !== "";
  const matched = searching ? new Set<string>(searchAlgorithms(query).map((a) => a.id)) : null;
  // 검색 중에는 일치하는 항목이 있는 폴더만 모두 펼쳐 보여준다 (펼침 상태는 건드리지 않는다)
  const folders = FAMILIES.map((f) => ({ ...f, ids: matched ? f.ids.filter((id) => matched.has(id)) : f.ids })).filter(
    (f) => f.ids.length > 0
  );
  const resultCount = folders.reduce((sum, f) => sum + f.ids.length, 0);

  const toggleFolder = (id: AlgorithmFamily) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const switchSlot = (next: Slot) => {
    setActiveSlot(next);
    setOpen((prev) => new Set(prev).add(getFamily(selected[next])));
  };

  return (
    <nav className="flex flex-col gap-4 h-full min-h-0" aria-label="알고리즘 선택">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-foreground font-bold text-lg">알고리즘</h2>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-muted">비교 모드</span>
          <button
            type="button"
            role="switch"
            aria-checked={compareMode}
            disabled={disabled}
            onClick={() => onCompareModeChange(!compareMode)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40",
              compareMode ? "bg-foreground" : "bg-gray-400 dark:bg-gray-600"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-background transition-transform",
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
                "flex items-center gap-2 px-2 py-2 rounded-lg border text-left transition-all min-w-0",
                slot === s ? SLOT_STYLE[s].ring : "border-line text-muted hover:bg-subtle"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 shrink-0 rounded-md text-[11px] font-black flex items-center justify-center",
                  SLOT_STYLE[s].chip
                )}
              >
                {s + 1}
              </span>
              <span className="text-xs font-bold truncate">{getAlgorithm(selected[s]).name}</span>
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
          placeholder={`검색 (${ALGORITHMS.length}종) — 예: 퀵, 힙`}
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

      {searching && (
        <p className="text-xs text-muted -my-2" aria-live="polite">
          {resultCount > 0 ? `검색 결과 ${resultCount}개` : `“${query.trim()}”에 맞는 알고리즘이 없어요.`}
        </p>
      )}

      <ul className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2 flex flex-col gap-0.5">
        {folders.map((f) => {
          const expanded = searching || open.has(f.id);
          return (
            <li key={f.id}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={searching ? undefined : () => toggleFolder(f.id)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-bold text-foreground hover:bg-subtle transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("w-3.5 h-3.5 shrink-0 text-faint transition-transform", expanded && "rotate-90")}
                  aria-hidden
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
                <span className="flex-1 text-left truncate">{f.name}</span>
                <span className="text-[11px] font-medium text-faint">{f.ids.length}</span>
              </button>

              {expanded && (
                <ul className="ml-3.5 mt-0.5 mb-1 border-l border-line pl-2 flex flex-col gap-0.5">
                  {f.ids.map((id) => {
                    const algo = getAlgorithm(id);
                    const isActive = selected[slot] === id;
                    const isOther = compareMode && selected[otherSlot] === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          aria-pressed={isActive}
                          disabled={disabled}
                          title={algo.desc}
                          onClick={() => onSelect(slot, id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md border text-left text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                            isActive
                              ? cn(SLOT_STYLE[slot].ring, "font-bold")
                              : "border-transparent text-gray-700 dark:text-gray-300 hover:bg-subtle hover:text-foreground"
                          )}
                        >
                          <span className="flex-1 truncate">{algo.name}</span>
                          {isOther && (
                            <span
                              className={cn(
                                "w-4 h-4 shrink-0 rounded text-[10px] font-black flex items-center justify-center",
                                SLOT_STYLE[otherSlot].chip
                              )}
                              title={`${otherSlot + 1}번 슬롯에서 선택됨`}
                            >
                              {otherSlot + 1}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
