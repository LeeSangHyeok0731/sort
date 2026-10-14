import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const combSort: SortAlgorithm = {
  id: "comb",
  name: "콤 정렬",
  category: "special",
  desc: "간격을 둔 버블 정렬 개선판",
  complexity: {
    best: "O(n log n)",
    average: "O(n²/2^p)",
    worst: "O(n²)",
    space: "O(1)",
  },
  stable: false,
  code: ALGO_CODE.comb,
  sort(t) {
    const n = t.length;
    let gap = n;
    let sorted = false;
    while (!sorted) {
      gap = Math.floor(gap / 1.3);
      if (gap <= 1) {
        gap = 1;
        sorted = true;
      }
      for (let i = 0; i + gap < n; i++) {
        if (t.cmp(i, i + gap) > 0) {
          t.swap(i, i + gap);
          sorted = false;
        }
      }
    }
  },
};
