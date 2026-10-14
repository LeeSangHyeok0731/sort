import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function doubleSelectionSort(arr) {
  for (let lo = 0, hi = arr.length - 1; lo < hi; lo++, hi--) {
    let min = lo, max = lo;
    // 한 번 훑으면서 최솟값과 최댓값을 함께 찾는다
    for (let i = lo + 1; i <= hi; i++) {
      if (arr[i] < arr[min]) min = i; //@cmp-min
      else if (arr[i] > arr[max]) max = i; //@cmp-max
    }
    [arr[lo], arr[min]] = [arr[min], arr[lo]]; //@swap-min
    // 최댓값이 lo에 있었다면 방금 min 자리로 옮겨졌다
    if (max === lo) max = min;
    [arr[hi], arr[max]] = [arr[max], arr[hi]]; //@swap-max
  }
  return arr;
}`);

const L = {
  cmpMin: CODE.line("cmp-min"),
  cmpMax: CODE.line("cmp-max"),
  swapMin: CODE.line("swap-min"),
  swapMax: CODE.line("swap-max"),
};

export const doubleSelectionSort: SortAlgorithm = {
  id: "doubleSelection",
  name: "양방향 선택 정렬",
  category: "standard",
  desc: "한 번에 최솟값과 최댓값을 함께 찾음",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    for (let lo = 0, hi = t.length - 1; lo < hi; lo++, hi--) {
      let min = lo;
      let max = lo;
      for (let i = lo + 1; i <= hi; i++) {
        if (t.cmp(i, min, L.cmpMin) < 0) min = i;
        else if (t.cmp(i, max, L.cmpMax) > 0) max = i;
      }
      t.swap(lo, min, L.swapMin);
      if (max === lo) max = min;
      t.swap(hi, max, L.swapMax);
    }
  },
};
