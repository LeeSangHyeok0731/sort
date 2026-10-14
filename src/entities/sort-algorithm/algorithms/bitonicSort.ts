import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

function compareAndSwap(t: Tracer, i: number, j: number, ascending: boolean) {
  const diff = t.cmp(i, j);
  if (ascending ? diff > 0 : diff < 0) t.swap(i, j);
}

/** cnt보다 작은 가장 큰 2의 거듭제곱 */
function greatestPowerOfTwoLessThan(cnt: number) {
  let k = 1;
  while (k < cnt) k <<= 1;
  return k >> 1;
}

function bitonicMerge(t: Tracer, low: number, cnt: number, ascending: boolean) {
  if (cnt <= 1) return;
  const k = greatestPowerOfTwoLessThan(cnt);
  for (let i = low; i < low + cnt - k; i++) compareAndSwap(t, i, i + k, ascending);
  bitonicMerge(t, low, k, ascending);
  bitonicMerge(t, low + k, cnt - k, ascending);
}

// 임의 길이 n을 지원하는 변형: 앞 절반은 반대 방향, 뒤 절반은 목표 방향으로 정렬 후 병합
function bitonicSortRange(t: Tracer, low: number, cnt: number, ascending: boolean) {
  if (cnt <= 1) return;
  const half = Math.floor(cnt / 2);
  bitonicSortRange(t, low, half, !ascending);
  bitonicSortRange(t, low + half, cnt - half, ascending);
  bitonicMerge(t, low, cnt, ascending);
}

export const bitonicSort: SortAlgorithm = {
  id: "bitonic",
  name: "비토닉 정렬",
  category: "special",
  desc: "병렬 처리에 적합한 수열 정렬",
  complexity: {
    best: "O(n log² n)",
    average: "O(n log² n)",
    worst: "O(n log² n)",
    space: "O(1)",
  },
  stable: false,
  code: ALGO_CODE.bitonic,
  sort(t) {
    bitonicSortRange(t, 0, t.length, true);
  },
};
