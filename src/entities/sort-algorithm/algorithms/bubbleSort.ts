import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const bubbleSort: SortAlgorithm = {
  id: "bubble",
  name: "버블 정렬",
  category: "standard",
  desc: "인접한 두 항을 비교하며 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: ALGO_CODE.bubble,
  sort(t) {
    const n = t.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        if (t.cmp(j, j + 1) > 0) {
          t.swap(j, j + 1);
          swapped = true;
        }
      }
      if (!swapped) break;
    }
  },
};
