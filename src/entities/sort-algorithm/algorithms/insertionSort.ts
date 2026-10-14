import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** [left, right] 구간을 인접 교환 방식의 삽입 정렬로 정렬한다. */
export function insertionSortRange(t: Tracer, left: number, right: number) {
  for (let i = left + 1; i <= right; i++) {
    for (let j = i; j > left && t.cmp(j - 1, j) > 0; j--) {
      t.swap(j - 1, j);
    }
  }
}

export const insertionSort: SortAlgorithm = {
  id: "insertion",
  name: "삽입 정렬",
  category: "standard",
  desc: "정렬된 부분에 요소를 삽입",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: ALGO_CODE.insertion,
  sort(t) {
    insertionSortRange(t, 0, t.length - 1);
  },
};
