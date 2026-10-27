"use client";

import { useState, type ReactNode } from "react";
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
  /** 이 사이드바가 고르는 슬롯 */
  slot: Slot;
  compareMode: boolean;
  /** 두 슬롯의 선택 (다른 슬롯의 선택은 배지로만 보여준다) */
  selected: readonly [AlgorithmId, AlgorithmId];
  onSelect: (id: AlgorithmId) => void;
  /** 제목 오른쪽에 둘 컨트롤 (비교 모드 스위치 등) */
  headerAction?: ReactNode;
  disabled?: boolean;
};

const SLOT_STYLE = {
  0: { chip: "bg-slot-1 text-background", ring: "border-slot-1 bg-blue-50 dark:bg-blue-500/15 text-slot-1" },
  1: { chip: "bg-slot-2 text-background", ring: "border-slot-2 bg-violet-50 dark:bg-violet-500/15 text-slot-2" },
} as const;

/** 알고리즘을 계열별 폴더 트리로 보여주고, 한 슬롯의 알고리즘을 고르는 사이드바 */
export default function AlgorithmSidebar({ slot, compareMode, selected, onSelect, headerAction, disabled }: Props) {
  const otherSlot: Slot = slot === 0 ? 1 : 0;

  // 처음에는 선택된 알고리즘이 든 폴더만 펼친다
  const [open, setOpen] = useState<ReadonlySet<AlgorithmFamily>>(() => new Set([getFamily(selected[slot])]));

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

  return (
    <nav className="flex flex-col gap-4 h-full min-h-0" aria-label={compareMode ? `${slot + 1}번 알고리즘 선택` : "알고리즘 선택"}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-foreground font-bold text-lg">
          {compareMode && (
            <span
              className={cn(
                "w-5 h-5 shrink-0 rounded-md text-[11px] font-black flex items-center justify-center",
                SLOT_STYLE[slot].chip
              )}
            >
              {slot + 1}
            </span>
          )}
          알고리즘
        </h2>
        {headerAction}
      </div>

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
                          onClick={() => onSelect(id)}
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
                              title={`${otherSlot + 1}번에서 선택됨`}
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
