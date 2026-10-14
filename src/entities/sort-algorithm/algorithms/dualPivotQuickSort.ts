import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** Yaroslavskiy 방식: 피벗 두 개(p ≤ q)로 세 구역을 만든다 */
function dualPivot(t: Tracer, lo: number, hi: number) {
  if (hi <= lo) return;

  // 1/3, 2/3 지점을 피벗 후보로 (정렬된 입력에서 최악을 피함)
  const third = Math.floor((hi - lo) / 3);
  t.swap(lo, lo + third);
  t.swap(hi, hi - third);
  if (t.cmp(lo, hi) > 0) t.swap(lo, hi);

  // 불변식: (lo, lt) < p, [lt, i) 는 p~q 사이, (gt, hi) > q
  let lt = lo + 1;
  let gt = hi - 1;
  let i = lo + 1;
  while (i <= gt) {
    if (t.cmp(i, lo) < 0) {
      t.swap(i++, lt++);
    } else if (t.cmp(i, hi) > 0) {
      t.swap(i, gt--);
    } else {
      i++;
    }
  }
  lt--;
  gt++;
  t.swap(lo, lt);
  t.swap(hi, gt);

  dualPivot(t, lo, lt - 1);
  // 두 피벗이 같으면 가운데 구역은 전부 같은 값이므로 건너뛴다
  if (t.cmp(lt, gt) < 0) dualPivot(t, lt + 1, gt - 1);
  dualPivot(t, gt + 1, hi);
}

export const dualPivotQuickSort: SortAlgorithm = {
  id: "dualPivot",
  name: "듀얼 피벗 퀵 정렬",
  category: "standard",
  desc: "피벗 두 개로 세 구역 분할 (Java 기본 정렬)",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
  },
  stable: false,
  code: ALGO_CODE.dualPivot,
  sort(t) {
    dualPivot(t, 0, t.length - 1);
  },
};
