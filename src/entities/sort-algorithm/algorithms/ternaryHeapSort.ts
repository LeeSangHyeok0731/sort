import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** 자식이 3개(3i+1, 3i+2, 3i+3)인 최대 힙에서 root를 아래로 내린다 */
function siftDown3(t: Tracer, size: number, root: number) {
  let i = root;
  for (;;) {
    let largest = i;
    for (let c = 3 * i + 1; c <= 3 * i + 3 && c < size; c++) {
      if (t.cmp(c, largest) > 0) largest = c;
    }
    if (largest === i) return;
    t.swap(i, largest);
    i = largest;
  }
}

export const ternaryHeapSort: SortAlgorithm = {
  id: "ternaryHeap",
  name: "3진 힙 정렬",
  category: "standard",
  desc: "자식이 3개인 힙으로 높이를 낮춘 힙 정렬",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
  },
  stable: false,
  code: ALGO_CODE.ternaryHeap,
  sort(t) {
    const n = t.length;
    for (let i = Math.floor((n - 2) / 3); i >= 0; i--) siftDown3(t, n, i);
    for (let end = n - 1; end > 0; end--) {
      t.swap(0, end);
      siftDown3(t, end, 0);
    }
  },
};
