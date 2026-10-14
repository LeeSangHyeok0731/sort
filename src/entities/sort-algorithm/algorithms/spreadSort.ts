import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { permuteIntoBuckets } from "./flashSort";
import { insertionSortRange } from "./insertionSort";
import { ALGO_CODE } from "./code";

/** 이보다 작은 구간은 비교 정렬로 처리 (Boost는 수천 개지만 시각화 크기에 맞춰 축소) */
const MIN_SPREAD_SIZE = 16;
const MAX_LOG_BINS = 8;

function bitLength(x: number) {
  return x <= 0 ? 0 : 32 - Math.clz32(x);
}

/**
 * Boost의 정수 spreadsort를 단순화: 값의 범위(최댓값-최솟값)의 비트 수와 원소 수로
 * 칸(bin) 개수를 정하고, 상위 비트로 칸에 나눈 뒤 칸마다 재귀(작으면 비교 정렬).
 */
function spread(t: Tracer, lo: number, hi: number) {
  const n = hi - lo + 1;
  if (n < 2) return;
  if (n < MIN_SPREAD_SIZE) {
    insertionSortRange(t, lo, hi);
    return;
  }
  let min = Infinity;
  let max = -Infinity;
  for (let i = lo; i <= hi; i++) {
    t.mark(i);
    min = Math.min(min, t.value(i));
    max = Math.max(max, t.value(i));
  }
  const logRange = bitLength(max - min);
  if (logRange === 0) return; // 모두 같은 값

  // 칸 수 = 2^logBins: 원소 수만큼은 넘지 않게
  const logBins = Math.min(logRange, MAX_LOG_BINS, Math.max(1, Math.floor(Math.log2(n)) - 1));
  const shift = logRange - logBins;
  const binOf = (i: number) => (t.value(i) - min) >> shift;

  const counts = new Array(1 << logBins).fill(0);
  for (let i = lo; i <= hi; i++) counts[binOf(i)]++;
  permuteIntoBuckets(t, lo, counts, binOf);

  if (shift === 0) return; // 칸 하나에 값 하나뿐
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
  code: ALGO_CODE.spread,
  sort(t) {
    spread(t, 0, t.length - 1);
  },
};
