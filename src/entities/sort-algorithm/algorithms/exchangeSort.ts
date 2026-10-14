import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const exchangeSort: SortAlgorithm = {
  id: "exchange",
  name: "교환 정렬",
  category: "standard",
  desc: "i번째와 그 뒤 모든 원소를 비교해 바로 교환",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: ALGO_CODE.exchange,
  sort(t) {
    const n = t.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (t.cmp(i, j) > 0) t.swap(i, j);
      }
    }
  },
};
