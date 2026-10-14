import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { heapSortRange } from "./heapSort";
import { insertionSortRange } from "./insertionSort";
import { lomutoPartition } from "./quickSort";

const INSERTION_THRESHOLD = 16;

const CODE = defineCode(`function introSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // 재귀 깊이 한도 2·log2(n): 넘으면 퀵 정렬이 최악으로 가고 있다는 신호
  sort(arr, 0, n - 1, 2 * Math.floor(Math.log2(n)));
  return arr;
}

function sort(arr, low, high, depthLimit) {
  while (high - low + 1 >= 16) {
    if (depthLimit === 0) {
      heapSort(arr, low, high); // 너무 깊어지면 힙 정렬로 전환 (최악 O(n log n) 보장)
      return;
    }
    depthLimit--;
    const p = partition(arr, low, high);
    sort(arr, p + 1, high, depthLimit);
    high = p - 1;
  }
  // 작은 구간(16 미만)은 삽입 정렬
  for (let i = low + 1; i <= high; i++) {
    for (let j = i; j > low && arr[j - 1] > arr[j]; j--) { //@cmp-insert
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap-insert
    }
  }
}

// 마지막 원소를 피벗으로 하는 Lomuto 분할
function partition(arr, low, high) {
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < arr[high]) { //@cmp-partition
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap-partition
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; //@swap-pivot
  return i + 1;
}

// [lo, hi] 구간 힙 정렬
function heapSort(arr, lo, hi) {
  const size = hi - lo + 1;
  for (let i = Math.floor(size / 2) - 1; i >= 0; i--) siftDown(arr, lo, size, i);
  for (let end = size - 1; end > 0; end--) {
    [arr[lo], arr[lo + end]] = [arr[lo + end], arr[lo]]; //@swap-heap-root
    siftDown(arr, lo, end, 0);
  }
}

function siftDown(arr, lo, size, i) {
  for (;;) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && arr[lo + l] > arr[lo + largest]) largest = l; //@cmp-heap-left
    if (r < size && arr[lo + r] > arr[lo + largest]) largest = r; //@cmp-heap-right
    if (largest === i) return;
    [arr[lo + i], arr[lo + largest]] = [arr[lo + largest], arr[lo + i]]; //@swap-heap-down
    i = largest;
  }
}`);

const L = {
  insert: { cmp: CODE.line("cmp-insert"), swap: CODE.line("swap-insert") },
  partition: {
    cmp: CODE.line("cmp-partition"),
    swap: CODE.line("swap-partition"),
    swapPivot: CODE.line("swap-pivot"),
  },
  heap: {
    cmpLeft: CODE.line("cmp-heap-left"),
    cmpRight: CODE.line("cmp-heap-right"),
    swapDown: CODE.line("swap-heap-down"),
    swapRoot: CODE.line("swap-heap-root"),
  },
};

function introSortRange(t: Tracer, low: number, high: number, depthLimit: number) {
  while (high - low + 1 >= INSERTION_THRESHOLD) {
    if (depthLimit === 0) {
      heapSortRange(t, low, high, L.heap);
      return;
    }
    depthLimit--;
    const p = lomutoPartition(t, low, high, L.partition);
    introSortRange(t, p + 1, high, depthLimit);
    high = p - 1;
  }
  insertionSortRange(t, low, high, L.insert);
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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    introSortRange(t, 0, n - 1, 2 * Math.floor(Math.log2(n)));
  },
};
