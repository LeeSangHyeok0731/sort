import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // 아직 정렬되지 않은 [i, n)에서 최솟값의 위치를 찾는다
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j; //@cmp
    }
    // 찾은 최솟값을 i번째 자리로
    if (minIdx !== i) [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; //@swap
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const selectionSort: SortAlgorithm = {
  id: "selection",
  name: "선택 정렬",
  category: "standard",
  desc: "최솟값을 찾아 앞으로 이동",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (t.cmp(j, minIdx, L.cmp) < 0) minIdx = j;
      }
      t.swap(i, minIdx, L.swap);
    }
  },
};
