import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function quickSort3Way(arr) {
  const stack = [[0, arr.length - 1]];
  while (stack.length > 0) {
    const [lo, hi] = stack.pop();
    if (lo >= hi) continue;
    // 가운데 원소를 피벗으로 맨 앞에 (정렬된 입력에서 최악을 피함)
    const mid = lo + Math.floor((hi - lo) / 2);
    [arr[lo], arr[mid]] = [arr[mid], arr[lo]]; //@swap-pivot
    // [lo, lt) < 피벗,  [lt, i) == 피벗,  (gt, hi] > 피벗
    // 피벗과 같은 값이 항상 arr[lt]에 있으므로 arr[lt]와 비교한다
    let lt = lo, gt = hi, i = lo + 1;
    while (i <= gt) {
      const c = arr[i] - arr[lt]; //@cmp
      if (c < 0) {
        [arr[lt], arr[i]] = [arr[i], arr[lt]]; //@swap-less
        lt++;
        i++;
      } else if (c > 0) {
        [arr[i], arr[gt]] = [arr[gt], arr[i]]; //@swap-greater
        gt--;
      } else {
        i++; // 피벗과 같은 값은 가운데에 모인다
      }
    }
    // 피벗과 같은 가운데 구역은 이미 제자리 → 양쪽만 다시
    stack.push([gt + 1, hi], [lo, lt - 1]);
  }
  return arr;
}`);

const L = {
  swapPivot: CODE.line("swap-pivot"),
  cmp: CODE.line("cmp"),
  swapLess: CODE.line("swap-less"),
  swapGreater: CODE.line("swap-greater"),
};

export const threeWayQuickSort: SortAlgorithm = {
  id: "quick3",
  name: "3-way 퀵 정렬",
  category: "standard",
  desc: "피벗보다 작음·같음·큼 세 구역으로 분할",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
  },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const stack: Array<[number, number]> = [[0, t.length - 1]];
    while (stack.length > 0) {
      const [lo, hi] = stack.pop()!;
      if (lo >= hi) continue;
      t.swap(lo, lo + Math.floor((hi - lo) / 2), L.swapPivot);
      let lt = lo;
      let gt = hi;
      let i = lo + 1;
      while (i <= gt) {
        const c = t.cmp(i, lt, L.cmp);
        if (c < 0) t.swap(lt++, i++, L.swapLess);
        else if (c > 0) t.swap(i, gt--, L.swapGreater);
        else i++;
      }
      stack.push([gt + 1, hi], [lo, lt - 1]);
    }
  },
};
