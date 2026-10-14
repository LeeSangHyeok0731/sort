import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function hoareQuickSort(arr) {
  const stack = [[0, arr.length - 1]];
  while (stack.length > 0) {
    const [lo, hi] = stack.pop();
    if (lo >= hi) continue;
    const j = partition(arr, lo, hi);
    stack.push([j + 1, hi], [lo, j]);
  }
  return arr;
}

// 가운데 값을 피벗으로, 양 끝에서 좁혀 오며 잘못된 쌍을 교환한다
// 반환값 j: [lo, j]는 피벗 이하, [j+1, hi]는 피벗 이상
function partition(arr, lo, hi) {
  const pivot = arr[lo + Math.floor((hi - lo) / 2)];
  let i = lo - 1, j = hi + 1;
  for (;;) {
    do i++; while (arr[i] < pivot); //@cmp-left
    do j--; while (arr[j] > pivot); //@cmp-right
    if (i >= j) return j; // 엇갈리면 분할 완료
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
  }
}`);

const L = { cmpLeft: CODE.line("cmp-left"), cmpRight: CODE.line("cmp-right"), swap: CODE.line("swap") };

/**
 * Hoare 분할. 피벗 원소도 교환으로 움직일 수 있으므로 그 위치를 따라가며 비교한다.
 */
function hoarePartition(t: Tracer, lo: number, hi: number) {
  let p = lo + Math.floor((hi - lo) / 2);
  let i = lo - 1;
  let j = hi + 1;
  for (;;) {
    do i++;
    while (t.cmp(i, p, L.cmpLeft) < 0);
    do j--;
    while (t.cmp(j, p, L.cmpRight) > 0);
    if (i >= j) return j;
    t.swap(i, j, L.swap);
    if (p === i) p = j;
    else if (p === j) p = i;
  }
}

export const hoareQuickSort: SortAlgorithm = {
  id: "hoareQuick",
  name: "호어 퀵 정렬",
  category: "standard",
  desc: "양 끝에서 좁혀 오는 원조 퀵 정렬 분할",
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
    const stack: Array<[number, number]> = [[0, t.length - 1]];
    while (stack.length > 0) {
      const [lo, hi] = stack.pop()!;
      if (lo >= hi) continue;
      const j = hoarePartition(t, lo, hi);
      stack.push([j + 1, hi], [lo, j]);
    }
  },
};
