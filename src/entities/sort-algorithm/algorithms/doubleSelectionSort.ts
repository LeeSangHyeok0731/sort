import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const doubleSelectionSort: SortAlgorithm = {
  id: "doubleSelection",
  name: "양방향 선택 정렬",
  category: "standard",
  desc: "한 번에 최솟값과 최댓값을 함께 찾음",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: ALGO_CODE.doubleSelection,
  sort(t) {
    for (let lo = 0, hi = t.length - 1; lo < hi; lo++, hi--) {
      let min = lo;
      let max = lo;
      for (let i = lo + 1; i <= hi; i++) {
        if (t.cmp(i, min) < 0) min = i;
        else if (t.cmp(i, max) > 0) max = i;
      }
      t.swap(lo, min);
      // 최댓값이 lo에 있었다면 방금 min 자리로 옮겨졌다
      if (max === lo) max = min;
      t.swap(hi, max);
    }
  },
};
