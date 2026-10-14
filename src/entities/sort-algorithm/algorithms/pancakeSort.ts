import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function pancakeSort(arr) {
  for (let size = arr.length; size > 1; size--) {
    // [0, size)에서 가장 큰 팬케이크의 위치
    let maxIdx = 0;
    for (let i = 1; i < size; i++) {
      if (arr[i] > arr[maxIdx]) maxIdx = i; //@cmp
    }
    if (maxIdx === size - 1) continue; // 이미 맨 아래
    if (maxIdx > 0) flip(arr, maxIdx); // 1) 가장 큰 것을 맨 위로 뒤집고
    flip(arr, size - 1); //               2) 통째로 뒤집어 맨 아래로
  }
  return arr;
}

// [0, end] 구간을 뒤집는다 (뒤집개로 위쪽 팬케이크를 뒤집듯)
function flip(arr, end) {
  for (let i = 0, j = end; i < j; i++, j--) {
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
  }
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

/** [0, end] 구간을 뒤집는다. */
function flip(t: Tracer, end: number) {
  for (let i = 0, j = end; i < j; i++, j--) t.swap(i, j, L.swap);
}

export const pancakeSort: SortAlgorithm = {
  id: "pancake",
  name: "팬케이크 정렬",
  category: "special",
  desc: "뒤집기를 이용한 정렬",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    for (let size = t.length; size > 1; size--) {
      let maxIdx = 0;
      for (let i = 1; i < size; i++) {
        if (t.cmp(i, maxIdx, L.cmp) > 0) maxIdx = i;
      }
      if (maxIdx === size - 1) continue;
      if (maxIdx > 0) flip(t, maxIdx);
      flip(t, size - 1);
    }
  },
};
