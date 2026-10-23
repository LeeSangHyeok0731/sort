"use client";

import { cn } from "@/shared/lib";
import { getAlgorithm, type AlgorithmId } from "@/entities/sort-algorithm";
import type { Slot } from "./AlgorithmPicker";

/** 슬롯 하나의 알고리즘 고유 옵션 (입력 중인 원본 문자열 그대로 보관) */
export type AlgorithmOptionValues = {
  shellGaps: string;
  bucketCount: number;
};

export const MIN_BUCKETS = 1;
export const MAX_BUCKETS = 20;

export const DEFAULT_OPTION_VALUES: AlgorithmOptionValues = {
  shellGaps: "",
  bucketCount: 5,
};

type SlotEntry = {
  slot: Slot;
  algorithmId: AlgorithmId;
  values: AlgorithmOptionValues;
};

type Props = {
  entries: readonly SlotEntry[];
  onChange: (slot: Slot, patch: Partial<AlgorithmOptionValues>) => void;
  disabled?: boolean;
};

const SLOT_CHIP = ["bg-slot-1", "bg-slot-2"] as const;

const inputClass =
  "bg-surface border border-line rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:border-foreground disabled:opacity-50";

function hasOptions(id: AlgorithmId) {
  return id === "shell" || id === "bucket";
}

/**
 * 슬롯마다 독립된 고유 옵션을 보여준다.
 * 비교 모드에서 같은 알고리즘을 두 슬롯에 놓고 옵션만 다르게 비교할 수 있다.
 */
export default function AlgorithmOptions({ entries, onChange, disabled }: Props) {
  const visible = entries.filter((e) => hasOptions(e.algorithmId));
  if (visible.length === 0) return null;
  const showSlotLabel = entries.length > 1;

  return (
    <div className="flex flex-col gap-3">
      {visible.map(({ slot, algorithmId, values }) => {
        const idPrefix = `slot${slot + 1}-${algorithmId}`;
        return (
          <fieldset
            key={slot}
            className="flex flex-col gap-3 p-4 rounded-lg bg-subtle border border-line"
          >
            <legend className="sr-only">
              {slot + 1}번 슬롯 {getAlgorithm(algorithmId).name} 옵션
            </legend>
            {showSlotLabel && (
              <div className="flex items-center gap-2 text-xs font-bold text-muted">
                <span
                  className={cn(
                    "w-4 h-4 rounded text-[10px] font-black text-background flex items-center justify-center",
                    SLOT_CHIP[slot]
                  )}
                >
                  {slot + 1}
                </span>
                {getAlgorithm(algorithmId).name}
              </div>
            )}

            {algorithmId === "shell" && (
              <label htmlFor={`${idPrefix}-gaps`} className="flex flex-col gap-2">
                <span className="text-xs font-bold text-muted">셸 정렬 간격</span>
                <input
                  id={`${idPrefix}-gaps`}
                  type="text"
                  inputMode="numeric"
                  value={values.shellGaps}
                  onChange={(e) => onChange(slot, { shellGaps: e.target.value })}
                  placeholder="비우면 n/2, n/4, … (예: 701, 301, 132, 57, 23, 10, 4, 1)"
                  disabled={disabled}
                  className={inputClass}
                />
                <span className="text-[11px] text-muted">마지막 간격이 1이 아니면 자동으로 1을 추가합니다.</span>
              </label>
            )}

            {algorithmId === "bucket" && (
              <label htmlFor={`${idPrefix}-buckets`} className="flex flex-col gap-2">
                <span className="flex justify-between text-xs font-bold text-muted">
                  <span>버킷 개수</span>
                  <span className="font-mono text-foreground">{values.bucketCount}개</span>
                </span>
                <input
                  id={`${idPrefix}-buckets`}
                  type="range"
                  min={MIN_BUCKETS}
                  max={MAX_BUCKETS}
                  value={values.bucketCount}
                  onChange={(e) => onChange(slot, { bucketCount: Number(e.target.value) })}
                  disabled={disabled}
                  className="accent-foreground"
                />
              </label>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
