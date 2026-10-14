import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const oddEvenSort: SortAlgorithm = {
  id: "oddEven",
  name: "오드-이븐 정렬",
  category: "special",
  desc: "홀수/짝수 위치 교차 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: ALGO_CODE.oddEven,
  sort(t) {
    const n = t.length;
    let sorted = false;
    while (!sorted) {
      sorted = true;
      for (const start of [1, 0]) {
        for (let i = start; i + 1 < n; i += 2) {
          if (t.cmp(i, i + 1) > 0) {
            t.swap(i, i + 1);
            sorted = false;
          }
        }
      }
    }
  },
};
