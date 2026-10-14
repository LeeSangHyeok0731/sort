import type { SortAlgorithm } from "../model/types";
import { mergeRuns } from "./mergeSort";
import { ALGO_CODE } from "./code";

export const bottomUpMergeSort: SortAlgorithm = {
  id: "bottomUpMerge",
  name: "상향식 병합 정렬",
  category: "standard",
  desc: "재귀 없이 크기 1, 2, 4… 구간을 차례로 병합",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
  },
  stable: true,
  code: ALGO_CODE.bottomUpMerge,
  sort(t) {
    const n = t.length;
    for (let width = 1; width < n; width *= 2) {
      for (let left = 0; left + width < n; left += 2 * width) {
        mergeRuns(t, left, left + width - 1, Math.min(left + 2 * width - 1, n - 1));
      }
    }
  },
};
