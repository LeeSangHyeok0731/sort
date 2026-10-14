import type { SortAlgorithm } from "../model/types";
import { insertionSortRange } from "./insertionSort";
import { mergeRuns } from "./mergeSort";
import { ALGO_CODE } from "./code";

const MIN_MERGE = 32;

export function minRunLength(n: number): number {
  let r = 0;
  while (n >= MIN_MERGE) {
    r |= n & 1;
    n >>= 1;
  }
  return n + r;
}

export const timSort: SortAlgorithm = {
  id: "tim",
  name: "팀 정렬",
  category: "special",
  desc: "삽입 + 병합 하이브리드",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
  },
  stable: true,
  code: ALGO_CODE.tim,
  sort(t) {
    const n = t.length;
    const minRun = minRunLength(n);

    for (let i = 0; i < n; i += minRun) {
      insertionSortRange(t, i, Math.min(i + minRun - 1, n - 1));
    }
    for (let size = minRun; size < n; size *= 2) {
      for (let left = 0; left < n; left += 2 * size) {
        const mid = left + size - 1;
        const right = Math.min(left + 2 * size - 1, n - 1);
        if (mid < right) mergeRuns(t, left, mid, right);
      }
    }
  },
};
