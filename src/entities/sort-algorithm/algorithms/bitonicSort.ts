import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function bitonicSort(arr) {
  sortRange(arr, 0, arr.length, true);
  return arr;
}

// 임의 길이 n을 지원하는 변형:
// 앞 절반은 반대 방향, 뒤 절반은 목표 방향으로 정렬해 "올라갔다 내려오는" 수열을 만든 뒤 병합
function sortRange(arr, low, cnt, ascending) {
  if (cnt <= 1) return;
  const half = Math.floor(cnt / 2);
  sortRange(arr, low, half, !ascending);
  sortRange(arr, low + half, cnt - half, ascending);
  merge(arr, low, cnt, ascending);
}

function merge(arr, low, cnt, ascending) {
  if (cnt <= 1) return;
  // cnt보다 작은 가장 큰 2의 거듭제곱 간격으로 비교-교환
  let k = 1;
  while (k < cnt) k <<= 1;
  k >>= 1;
  for (let i = low; i < low + cnt - k; i++) {
    const diff = arr[i] - arr[i + k]; //@cmp
    if (ascending ? diff > 0 : diff < 0) {
      [arr[i], arr[i + k]] = [arr[i + k], arr[i]]; //@swap
    }
  }
  merge(arr, low, k, ascending);
  merge(arr, low + k, cnt - k, ascending);
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

function compareAndSwap(t: Tracer, i: number, j: number, ascending: boolean) {
  const diff = t.cmp(i, j, L.cmp);
  if (ascending ? diff > 0 : diff < 0) t.swap(i, j, L.swap);
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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    bitonicSortRange(t, 0, t.length, true);
  },
};
