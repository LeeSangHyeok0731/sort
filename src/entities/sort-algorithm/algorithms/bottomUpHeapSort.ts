import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function bottomUpHeapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(arr, n, i);
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]]; //@swap-root
    siftDown(arr, end, 0);
  }
  return arr;
}

// Wegener의 상향식 sift-down: 일반 힙 정렬보다 비교가 거의 절반
function siftDown(arr, size, root) {
  // 1) 루트와 비교하지 않고 더 큰 자식만 따라 잎까지 내려간다 (레벨당 비교 1번)
  let j = root;
  while (2 * j + 2 < size) {
    j = arr[2 * j + 1] > arr[2 * j + 2] ? 2 * j + 1 : 2 * j + 2; //@cmp-children
  }
  if (2 * j + 1 < size) j = 2 * j + 1;
  // 2) 잎에서 올라오며 루트 값이 들어갈 자리를 찾는다 (보통 금방 찾는다)
  while (j !== root && arr[j] < arr[root]) j = (j - 1) >> 1; //@cmp-climb
  // 3) 루트 값을 경로를 따라 그 자리까지 내려 보낸다 (경로의 값은 한 칸씩 위로)
  const path = [];
  for (let k = j; k !== root; k = (k - 1) >> 1) path.push(k);
  let cur = root;
  for (let k = path.length - 1; k >= 0; k--) {
    [arr[cur], arr[path[k]]] = [arr[path[k]], arr[cur]]; //@swap-path
    cur = path[k];
  }
}`);

const L = {
  swapRoot: CODE.line("swap-root"),
  cmpChildren: CODE.line("cmp-children"),
  cmpClimb: CODE.line("cmp-climb"),
  swapPath: CODE.line("swap-path"),
};

function siftDownBottomUp(t: Tracer, size: number, root: number) {
  let j = root;
  while (2 * j + 2 < size) j = t.cmp(2 * j + 1, 2 * j + 2, L.cmpChildren) > 0 ? 2 * j + 1 : 2 * j + 2;
  if (2 * j + 1 < size) j = 2 * j + 1;

  while (j !== root && t.cmp(j, root, L.cmpClimb) < 0) j = (j - 1) >> 1;

  const path: number[] = [];
  for (let k = j; k !== root; k = (k - 1) >> 1) path.push(k);
  let cur = root;
  for (let k = path.length - 1; k >= 0; k--) {
    t.swap(cur, path[k], L.swapPath);
    cur = path[k];
  }
}

export const bottomUpHeapSort: SortAlgorithm = {
  id: "bottomUpHeap",
  name: "상향식 힙 정렬",
  category: "standard",
  desc: "잎까지 먼저 내려간 뒤 거슬러 올라오는 힙 정렬",
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
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDownBottomUp(t, n, i);
    for (let end = n - 1; end > 0; end--) {
      t.swap(0, end, L.swapRoot);
      siftDownBottomUp(t, end, 0);
    }
  },
};
