import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function dualPivotQuickSort(arr, lo = 0, hi = arr.length - 1) {
  if (hi <= lo) return arr;
  // 1/3, 2/3 지점을 피벗 후보로 양 끝에 둔다 (정렬된 입력에서 최악을 피함)
  const third = Math.floor((hi - lo) / 3);
  [arr[lo], arr[lo + third]] = [arr[lo + third], arr[lo]]; //@swap-candidate-left
  [arr[hi], arr[hi - third]] = [arr[hi - third], arr[hi]]; //@swap-candidate-right
  if (arr[lo] > arr[hi]) { //@cmp-pivots
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]]; //@swap-pivots
  }
  // 피벗 p = arr[lo], q = arr[hi]  (p <= q)
  // (lo, lt) < p,  [lt, i) 는 p ~ q,  (gt, hi) > q
  let lt = lo + 1, gt = hi - 1, i = lo + 1;
  while (i <= gt) {
    if (arr[i] < arr[lo]) { //@cmp-p
      [arr[i], arr[lt]] = [arr[lt], arr[i]]; //@swap-less
      i++;
      lt++;
    } else if (arr[i] > arr[hi]) { //@cmp-q
      [arr[i], arr[gt]] = [arr[gt], arr[i]]; //@swap-greater
      gt--;
    } else {
      i++;
    }
  }
  lt--;
  gt++;
  // 피벗을 경계 자리로
  [arr[lo], arr[lt]] = [arr[lt], arr[lo]]; //@swap-place-p
  [arr[hi], arr[gt]] = [arr[gt], arr[hi]]; //@swap-place-q
  dualPivotQuickSort(arr, lo, lt - 1);
  // 두 피벗이 같으면 가운데는 전부 같은 값이라 건너뛴다
  if (arr[lt] < arr[gt]) dualPivotQuickSort(arr, lt + 1, gt - 1); //@cmp-middle
  dualPivotQuickSort(arr, gt + 1, hi);
  return arr;
}`);

const L = {
  swapCandidateLeft: CODE.line("swap-candidate-left"),
  swapCandidateRight: CODE.line("swap-candidate-right"),
  cmpPivots: CODE.line("cmp-pivots"),
  swapPivots: CODE.line("swap-pivots"),
  cmpP: CODE.line("cmp-p"),
  swapLess: CODE.line("swap-less"),
  cmpQ: CODE.line("cmp-q"),
  swapGreater: CODE.line("swap-greater"),
  swapPlaceP: CODE.line("swap-place-p"),
  swapPlaceQ: CODE.line("swap-place-q"),
  cmpMiddle: CODE.line("cmp-middle"),
};

function dualPivot(t: Tracer, lo: number, hi: number) {
  if (hi <= lo) return;
  const third = Math.floor((hi - lo) / 3);
  t.swap(lo, lo + third, L.swapCandidateLeft);
  t.swap(hi, hi - third, L.swapCandidateRight);
  if (t.cmp(lo, hi, L.cmpPivots) > 0) t.swap(lo, hi, L.swapPivots);

  let lt = lo + 1;
  let gt = hi - 1;
  let i = lo + 1;
  while (i <= gt) {
    if (t.cmp(i, lo, L.cmpP) < 0) {
      t.swap(i++, lt++, L.swapLess);
    } else if (t.cmp(i, hi, L.cmpQ) > 0) {
      t.swap(i, gt--, L.swapGreater);
    } else {
      i++;
    }
  }
  lt--;
  gt++;
  t.swap(lo, lt, L.swapPlaceP);
  t.swap(hi, gt, L.swapPlaceQ);

  dualPivot(t, lo, lt - 1);
  if (t.cmp(lt, gt, L.cmpMiddle) < 0) dualPivot(t, lt + 1, gt - 1);
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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    dualPivot(t, 0, t.length - 1);
  },
};
