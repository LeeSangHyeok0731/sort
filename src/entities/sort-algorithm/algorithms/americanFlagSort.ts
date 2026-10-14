import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { permuteIntoBuckets } from "./flashSort";
import { insertionSortRange } from "./insertionSort";
import { ALGO_CODE } from "./code";

const SMALL = 8;

function flag(t: Tracer, lo: number, hi: number, exp: number) {
  if (hi - lo < 1 || exp < 1) return;
  if (hi - lo + 1 <= SMALL) {
    insertionSortRange(t, lo, hi);
    return;
  }
  const digit = (i: number) => Math.floor(t.value(i) / exp) % 10;
  const counts = new Array(10).fill(0);
  for (let i = lo; i <= hi; i++) {
    t.mark(i);
    counts[digit(i)]++;
  }
  // MSD 기수 정렬과 같지만 보조 배열 없이 교환만으로 자릿수별 칸에 넣는다
  permuteIntoBuckets(t, lo, counts, digit);
  let start = lo;
  for (const c of counts) {
    flag(t, start, start + c - 1, exp / 10);
    start += c;
  }
}

export const americanFlagSort: SortAlgorithm = {
  id: "americanFlag",
  name: "아메리칸 플래그 정렬",
  category: "linear",
  desc: "교환만으로 자릿수별 칸을 채우는 MSD 기수 정렬",
  complexity: {
    best: "O(n)",
    average: "O(d·n)",
    worst: "O(d·n)",
    space: "O(d·10)",
  },
  stable: false,
  code: ALGO_CODE.americanFlag,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    let max = 0;
    for (let i = 0; i < n; i++) max = Math.max(max, t.value(i));
    let exp = 1;
    while (Math.floor(max / exp) >= 10) exp *= 10;
    flag(t, 0, n - 1, exp);
  },
};
