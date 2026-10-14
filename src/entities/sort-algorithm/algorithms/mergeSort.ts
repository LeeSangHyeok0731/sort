import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/**
 * 정렬된 두 구간 [left, mid], [mid + 1, right]를 병합한다.
 * 오른쪽 원소가 더 작으면 왼쪽 원소 앞으로 move 하므로 id 중복 없이 안정적으로 병합된다.
 */
export function mergeRuns(t: Tracer, left: number, mid: number, right: number) {
  let i = left;
  let j = mid + 1;
  while (i < j && j <= right) {
    if (t.cmp(j, i) < 0) {
      t.move(j, i);
      j++;
    }
    i++;
  }
}

export const mergeSort: SortAlgorithm = {
  id: "merge",
  name: "병합 정렬",
  category: "standard",
  desc: "반으로 나누어 정렬 후 병합",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
  },
  stable: true,
  code: ALGO_CODE.merge,
  sort(t) {
    const sort = (left: number, right: number) => {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      sort(left, mid);
      sort(mid + 1, right);
      mergeRuns(t, left, mid, right);
    };
    sort(0, t.length - 1);
  },
};
