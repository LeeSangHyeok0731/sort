"use client";

import type { AlgorithmId } from "@/entities/sort-algorithm";

type Props = {
  selected: readonly AlgorithmId[];
  shellGaps: string;
  onShellGapsChange: (value: string) => void;
  bucketCount: number;
  onBucketCountChange: (value: number) => void;
  disabled?: boolean;
};

export const MIN_BUCKETS = 1;
export const MAX_BUCKETS = 20;

/** 선택된 알고리즘 중 셸/버킷 정렬이 있을 때만 해당 옵션을 보여준다. */
export default function AlgorithmOptions({
  selected,
  shellGaps,
  onShellGapsChange,
  bucketCount,
  onBucketCountChange,
  disabled,
}: Props) {
  const hasShell = selected.includes("shell");
  const hasBucket = selected.includes("bucket");
  if (!hasShell && !hasBucket) return null;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
      {hasShell && (
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold text-white/50">셸 정렬 간격</span>
          <input
            type="text"
            inputMode="numeric"
            value={shellGaps}
            onChange={(e) => onShellGapsChange(e.target.value)}
            placeholder="비우면 n/2, n/4, … (예: 701, 301, 132, 57, 23, 10, 4, 1)"
            disabled={disabled}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400 disabled:opacity-50"
          />
          <span className="text-[11px] text-white/30">마지막 간격이 1이 아니면 자동으로 1을 추가합니다.</span>
        </label>
      )}
      {hasBucket && (
        <label className="flex flex-col gap-2">
          <span className="flex justify-between text-xs font-bold text-white/50">
            <span>버킷 개수</span>
            <span className="font-mono text-indigo-300">{bucketCount}개</span>
          </span>
          <input
            type="range"
            min={MIN_BUCKETS}
            max={MAX_BUCKETS}
            value={bucketCount}
            onChange={(e) => onBucketCountChange(Number(e.target.value))}
            disabled={disabled}
            className="accent-indigo-500"
          />
        </label>
      )}
    </div>
  );
}
