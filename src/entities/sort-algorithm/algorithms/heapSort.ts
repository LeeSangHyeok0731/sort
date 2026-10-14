import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

type HeapLines = { cmpLeft: number; cmpRight: number; swapDown: number; swapRoot: number };
const NO_LINES: HeapLines = { cmpLeft: 0, cmpRight: 0, swapDown: 0, swapRoot: 0 };

function siftDown(t: Tracer, offset: number, size: number, root: number, lines: HeapLines) {
  let i = root;
  while (true) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < size && t.cmp(offset + l, offset + largest, lines.cmpLeft) > 0) largest = l;
    if (r < size && t.cmp(offset + r, offset + largest, lines.cmpRight) > 0) largest = r;
    if (largest === i) return;
    t.swap(offset + i, offset + largest, lines.swapDown);
    i = largest;
  }
}

/** [left, right] 구간을 힙 정렬한다. lines: 설명 코드 줄 번호 (선택) */
export function heapSortRange(t: Tracer, left: number, right: number, lines: HeapLines = NO_LINES) {
  const size = right - left + 1;
  for (let i = Math.floor(size / 2) - 1; i >= 0; i--) siftDown(t, left, size, i, lines);
  for (let end = size - 1; end > 0; end--) {
    t.swap(left, left + end, lines.swapRoot);
    siftDown(t, left, end, 0, lines);
  }
}

const CODE = defineCode(`function heapSort(arr) {
  const n = arr.length;
  // 1) 최대 힙 만들기: 자식이 있는 마지막 노드부터 거꾸로 내려보낸다
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(arr, n, i);
  // 2) 루트(최댓값)를 맨 뒤로 보내고, 힙을 하나 줄여 다시 정리
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]]; //@swap-root
    siftDown(arr, end, 0);
  }
  return arr;
}

// i번 노드를 자식들보다 작지 않을 때까지 아래로 내린다
function siftDown(arr, size, i) {
  for (;;) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && arr[l] > arr[largest]) largest = l; //@cmp-left
    if (r < size && arr[r] > arr[largest]) largest = r; //@cmp-right
    if (largest === i) return;
    [arr[i], arr[largest]] = [arr[largest], arr[i]]; //@swap-down
    i = largest;
  }
}`);

const L: HeapLines = {
  cmpLeft: CODE.line("cmp-left"),
  cmpRight: CODE.line("cmp-right"),
  swapDown: CODE.line("swap-down"),
  swapRoot: CODE.line("swap-root"),
};

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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    heapSortRange(t, 0, t.length - 1, L);
  },
};
