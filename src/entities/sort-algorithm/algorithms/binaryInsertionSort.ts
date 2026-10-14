import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const binaryInsertionSort: SortAlgorithm = {
  id: "binaryInsertion",
  name: "이진 삽입 정렬",
  category: "standard",
  desc: "삽입 위치를 이진 탐색으로 찾는 삽입 정렬",
  complexity: {
    best: "O(n log n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
  },
  stable: true,
  code: ALGO_CODE.binaryInsertion,
  sort(t) {
    for (let i = 1; i < t.length; i++) {
      // [0, i)에서 a[i]보다 큰 첫 위치 (같은 값 뒤에 넣어 안정성 유지)
      let lo = 0;
      let hi = i;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (t.cmp(mid, i) > 0) hi = mid;
        else lo = mid + 1;
      }
      t.move(i, lo);
    }
  },
};
