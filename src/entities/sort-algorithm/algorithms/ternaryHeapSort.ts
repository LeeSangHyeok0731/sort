import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function ternaryHeapSort(arr) {
  const n = arr.length;
  // 자식이 3개(3i+1, 3i+2, 3i+3)인 최대 힙을 만든다
  for (let i = Math.floor((n - 2) / 3); i >= 0; i--) siftDown(arr, n, i);
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]]; //@swap-root
    siftDown(arr, end, 0);
  }
  return arr;
}

function siftDown(arr, size, i) {
  for (;;) {
    let largest = i;
    // 세 자식 중 가장 큰 값을 찾는다 (2진 힙보다 높이가 낮다)
    for (let c = 3 * i + 1; c <= 3 * i + 3 && c < size; c++) {
      if (arr[c] > arr[largest]) largest = c; //@cmp-child
    }
    if (largest === i) return;
    [arr[i], arr[largest]] = [arr[largest], arr[i]]; //@swap-down
    i = largest;
  }
}`);

const L = { swapRoot: CODE.line("swap-root"), cmpChild: CODE.line("cmp-child"), swapDown: CODE.line("swap-down") };

/** 자식이 3개(3i+1, 3i+2, 3i+3)인 최대 힙에서 root를 아래로 내린다 */
function siftDown3(t: Tracer, size: number, root: number) {
  let i = root;
  for (;;) {
    let largest = i;
    for (let c = 3 * i + 1; c <= 3 * i + 3 && c < size; c++) {
      if (t.cmp(c, largest, L.cmpChild) > 0) largest = c;
    }
    if (largest === i) return;
    t.swap(i, largest, L.swapDown);
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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let i = Math.floor((n - 2) / 3); i >= 0; i--) siftDown3(t, n, i);
    for (let end = n - 1; end > 0; end--) {
      t.swap(0, end, L.swapRoot);
      siftDown3(t, end, 0);
    }
  },
};
