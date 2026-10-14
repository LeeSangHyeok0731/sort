import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** 구간의 양 끝을 안쪽으로 좁혀 가며 비교한 뒤 두 절반에 재귀. 교환이 있었는지 반환한다. */
function circle(t: Tracer, lo: number, hi: number): boolean {
  if (lo >= hi) return false;
  let swapped = false;
  let l = lo;
  let h = hi;
  while (l < h) {
    if (t.cmp(l, h) > 0) {
      t.swap(l, h);
      swapped = true;
    }
    l++;
    h--;
  }
  // 길이가 홀수면 가운데 원소를 바로 오른쪽 원소와 비교
  if (l === h && t.cmp(l, h + 1) > 0) {
    t.swap(l, h + 1);
    swapped = true;
  }
  const mid = Math.floor((lo + hi) / 2);
  const left = circle(t, lo, mid);
  const right = circle(t, mid + 1, hi);
  return swapped || left || right;
}

export const circleSort: SortAlgorithm = {
  id: "circle",
  name: "서클 정렬",
  category: "special",
  desc: "양 끝에서 안쪽으로 원을 그리며 비교",
  complexity: {
    best: "O(n log n)",
    average: "O(n log² n)",
    worst: "O(n log² n)",
    space: "O(log n)",
  },
  stable: false,
  code: ALGO_CODE.circle,
  sort(t) {
    while (circle(t, 0, t.length - 1));
  },
};
