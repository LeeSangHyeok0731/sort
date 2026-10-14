import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

function siftDown(t: Tracer, offset: number, size: number, root: number) {
  let i = root;
  while (true) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < size && t.cmp(offset + l, offset + largest) > 0) largest = l;
    if (r < size && t.cmp(offset + r, offset + largest) > 0) largest = r;
    if (largest === i) return;
    t.swap(offset + i, offset + largest);
    i = largest;
  }
}

/** [left, right] 구간을 힙 정렬한다. */
export function heapSortRange(t: Tracer, left: number, right: number) {
  const size = right - left + 1;
  for (let i = Math.floor(size / 2) - 1; i >= 0; i--) siftDown(t, left, size, i);
  for (let end = size - 1; end > 0; end--) {
    t.swap(left, left + end);
    siftDown(t, left, end, 0);
  }
}

export const heapSort: SortAlgorithm = {
  id: "heap",
  name: "힙 정렬",
  category: "standard",
  desc: "힙 자료구조를 이용한 정렬",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
  },
  stable: false,
  code: ALGO_CODE.heap,
  sort(t) {
    heapSortRange(t, 0, t.length - 1);
  },
};
