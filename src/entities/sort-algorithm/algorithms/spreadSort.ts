import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { permuteIntoBuckets } from "./flashSort";
import { insertionSortRange } from "./insertionSort";

/** 이보다 작은 구간은 비교 정렬로 처리 (Boost는 수천 개지만 시각화 크기에 맞춰 축소) */
const MIN_SPREAD_SIZE = 16;
const MAX_LOG_BINS = 8;

const CODE = defineCode(`// 스프레드 정렬 (Boost 정수 spreadsort를 단순화)
function spreadSort(arr, lo = 0, hi = arr.length - 1) {
  const n = hi - lo + 1;
  if (n < 2) return arr;
  // 작은 구간은 비교 정렬 (Boost는 수천 개 기준, 시각화 크기에 맞춰 축소)
  if (n < 16) {
    for (let i = lo + 1; i <= hi; i++) {
      for (let j = i; j > lo && arr[j - 1] > arr[j]; j--) { //@cmp
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap
      }
    }
    return arr;
  }
  let min = Infinity, max = -Infinity;
  for (let i = lo; i <= hi; i++) {
    const x = arr[i]; //@read-range
    min = Math.min(min, x);
    max = Math.max(max, x);
  }
  const logRange = max - min <= 0 ? 0 : 32 - Math.clz32(max - min);
  if (logRange === 0) return arr; // 모두 같은 값
  // 값 범위의 비트 수와 원소 수로 칸 수(2^logBins)를 정한다
  const logBins = Math.min(logRange, 8, Math.max(1, Math.floor(Math.log2(n)) - 1));
  const shift = logRange - logBins;
  const bin = (x) => (x - min) >> shift; // 상위 비트 = 칸 번호
  const count = new Array(1 << logBins).fill(0);
  for (let i = lo; i <= hi; i++) count[bin(arr[i])]++;
  const next = [], end = [];
  for (let b = 0, pos = lo; b < count.length; b++) {
    next.push(pos);
    pos += count[b];
    end.push(pos);
  }
  // 교환만으로 원소를 제 칸에 넣는다
  for (let b = 0; b < count.length; b++) {
    while (next[b] < end[b]) {
      const target = bin(arr[next[b]]); //@read-bin
      if (target === b) next[b]++;
      else {
        const j = next[target]++;
        [arr[next[b]], arr[j]] = [arr[j], arr[next[b]]]; //@swap-throw
      }
    }
  }
  if (shift === 0) return arr; // 칸 하나에 값 하나뿐
  // 칸마다 남은 하위 비트로 다시
  for (let b = 0, start = lo; b < count.length; b++) {
    spreadSort(arr, start, start + count[b] - 1);
    start += count[b];
  }
  return arr;
}`);

const L = {
  cmp: CODE.line("cmp"),
  swap: CODE.line("swap"),
  readRange: CODE.line("read-range"),
  readBin: CODE.line("read-bin"),
  swapThrow: CODE.line("swap-throw"),
};

function bitLength(x: number) {
  return x <= 0 ? 0 : 32 - Math.clz32(x);
}

function spread(t: Tracer, lo: number, hi: number) {
  const n = hi - lo + 1;
  if (n < 2) return;
  if (n < MIN_SPREAD_SIZE) {
    insertionSortRange(t, lo, hi, L);
    return;
  }
  let min = Infinity;
  let max = -Infinity;
  for (let i = lo; i <= hi; i++) {
    t.mark(i, L.readRange);
    min = Math.min(min, t.value(i));
    max = Math.max(max, t.value(i));
  }
  const logRange = bitLength(max - min);
  if (logRange === 0) return;

  const logBins = Math.min(logRange, MAX_LOG_BINS, Math.max(1, Math.floor(Math.log2(n)) - 1));
  const shift = logRange - logBins;
  const binOf = (i: number) => (t.value(i) - min) >> shift;

  const counts = new Array(1 << logBins).fill(0);
  for (let i = lo; i <= hi; i++) counts[binOf(i)]++;
  permuteIntoBuckets(t, lo, counts, binOf, { read: L.readBin, swap: L.swapThrow });

  if (shift === 0) return;
  let start = lo;
  for (const c of counts) {
    spread(t, start, start + c - 1);
    start += c;
  }
}

export const spreadSort: SortAlgorithm = {
  id: "spread",
  name: "스프레드 정렬",
  category: "linear",
  desc: "값 범위에 맞춰 칸 수를 정하는 기수+비교 하이브리드",
  complexity: {
    best: "O(n)",
    average: "O(n·√log k)",
    worst: "O(n·min(log k, log n))",
    space: "O(2^b)",
  },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    spread(t, 0, t.length - 1);
  },
};
