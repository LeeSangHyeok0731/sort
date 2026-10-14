import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const selectionSort: SortAlgorithm = {
  id: "selection",
  name: "선택 정렬",
  category: "standard",
  desc: "최솟값을 찾아 앞으로 이동",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: ALGO_CODE.selection,
  sort(t) {
    const n = t.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (t.cmp(j, minIdx) < 0) minIdx = j;
      }
      t.swap(i, minIdx);
    }
  },
};
