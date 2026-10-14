import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/**
 * Wegener의 상향식 sift-down.
 * 1) 루트와 비교하지 않고 더 큰 자식만 따라 잎까지 내려간다 (레벨당 비교 1번)
 * 2) 잎에서 위로 올라오며 루트 값이 들어갈 자리를 찾는다 (보통 금방 찾는다)
 * 3) 루트에서 그 자리까지의 경로를 한 칸씩 끌어올린다
 */
function siftDownBottomUp(t: Tracer, size: number, root: number) {
  let j = root;
  while (2 * j + 2 < size) j = t.cmp(2 * j + 1, 2 * j + 2) > 0 ? 2 * j + 1 : 2 * j + 2;
  if (2 * j + 1 < size) j = 2 * j + 1;

  while (j !== root && t.cmp(j, root) < 0) j = (j - 1) >> 1;

  const path: number[] = [];
  for (let k = j; k !== root; k = (k - 1) >> 1) path.push(k);
  // 루트 값을 경로를 따라 j까지 내려 보낸다 (경로의 값들은 한 칸씩 올라간다)
  let cur = root;
  for (let k = path.length - 1; k >= 0; k--) {
    t.swap(cur, path[k]);
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
  code: ALGO_CODE.bottomUpHeap,
  sort(t) {
    const n = t.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDownBottomUp(t, n, i);
    for (let end = n - 1; end > 0; end--) {
      t.swap(0, end);
      siftDownBottomUp(t, end, 0);
    }
  },
};
