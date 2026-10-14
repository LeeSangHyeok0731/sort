import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

/** 사용자 간격을 정리한다. 마지막 간격이 1이 아니면 1을 덧붙여 항상 정렬이 끝나도록 한다. */
export function normalizeGaps(gaps: number[] | undefined, n: number): number[] {
  const valid = [...new Set((gaps ?? []).filter((g) => Number.isInteger(g) && g > 0 && g < n))]
    .sort((a, b) => b - a);
  if (valid.length === 0) {
    const defaults: number[] = [];
    for (let g = Math.floor(n / 2); g > 0; g = Math.floor(g / 2)) defaults.push(g);
    return defaults;
  }
  if (valid[valid.length - 1] !== 1) valid.push(1);
  return valid;
}

export const shellSort: SortAlgorithm = {
  id: "shell",
  name: "셸 정렬",
  category: "standard",
  desc: "간격을 조절하며 삽입 정렬",
  complexity: {
    best: "O(n log n)",
    average: "간격에 따라 다름",
    worst: "O(n²)",
    space: "O(1)",
  },
  stable: false,
  code: ALGO_CODE.shell,
  sort(t, { shellGaps }) {
    const n = t.length;
    for (const gap of normalizeGaps(shellGaps, n)) {
      for (let i = gap; i < n; i++) {
        for (let j = i; j >= gap && t.cmp(j - gap, j) > 0; j -= gap) {
          t.swap(j - gap, j);
        }
      }
    }
  },
};
