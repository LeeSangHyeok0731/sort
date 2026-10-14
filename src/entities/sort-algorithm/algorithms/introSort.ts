import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { heapSortRange } from "./heapSort";
import { insertionSortRange } from "./insertionSort";
import { lomutoPartition } from "./quickSort";
import { ALGO_CODE } from "./code";

const INSERTION_THRESHOLD = 16;

function introSortRange(t: Tracer, low: number, high: number, depthLimit: number) {
  while (high - low + 1 >= INSERTION_THRESHOLD) {
    if (depthLimit === 0) {
      heapSortRange(t, low, high);
      return;
    }
    depthLimit--;
    const p = lomutoPartition(t, low, high);
    introSortRange(t, p + 1, high, depthLimit);
    high = p - 1;
  }
  insertionSortRange(t, low, high);
}

export const introSort: SortAlgorithm = {
  id: "intro",
  name: "인트로 정렬",
  category: "special",
  desc: "퀵 + 힙 + 삽입 하이브리드",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(log n)",
  },
  stable: false,
  code: ALGO_CODE.intro,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    introSortRange(t, 0, n - 1, 2 * Math.floor(Math.log2(n)));
  },
};
