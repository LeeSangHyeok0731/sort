import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function combSort(arr) {
  const n = arr.length;
  let gap = n;
  let sorted = false;
  while (!sorted) {
    // 간격을 1.3으로 나누며 줄인다 (멀리 있는 "거북이" 값을 빨리 옮김)
    gap = Math.floor(gap / 1.3);
    if (gap <= 1) {
      gap = 1;
      sorted = true; // 간격 1로 한 바퀴 돌 때 교환이 없으면 끝
    }
    for (let i = 0; i + gap < n; i++) {
      if (arr[i] > arr[i + gap]) { //@cmp
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]]; //@swap
        sorted = false;
      }
    }
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const combSort: SortAlgorithm = {
  id: "comb",
  name: "콤 정렬",
  category: "special",
  desc: "간격을 둔 버블 정렬 개선판",
  complexity: {
    best: "O(n log n)",
    average: "O(n²/2^p)",
    worst: "O(n²)",
    space: "O(1)",
  },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    let gap = n;
    let sorted = false;
    while (!sorted) {
      gap = Math.floor(gap / 1.3);
      if (gap <= 1) {
        gap = 1;
        sorted = true;
      }
      for (let i = 0; i + gap < n; i++) {
        if (t.cmp(i, i + gap, L.cmp) > 0) {
          t.swap(i, i + gap, L.swap);
          sorted = false;
        }
      }
    }
  },
};
