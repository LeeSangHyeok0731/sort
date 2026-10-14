import type { ArrayItem } from "@/shared/model";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** [lo, hi] 구간을 exp 자릿수로 나누고, 각 묶음을 다음 자릿수로 재귀 정렬한다. */
function msd(t: Tracer, lo: number, hi: number, exp: number) {
  if (hi <= lo || exp < 1) return;

  const digit = (i: number) => Math.floor(t.value(i) / exp) % 10;
  const groups: ArrayItem[][] = Array.from({ length: 10 }, () => []);
  for (let i = lo; i <= hi; i++) {
    t.mark(i);
    groups[digit(i)].push(t.item(i));
  }
  t.arrange(lo, groups.flat());

  let start = lo;
  for (const group of groups) {
    msd(t, start, start + group.length - 1, exp / 10);
    start += group.length;
  }
}

export const msdRadixSort: SortAlgorithm = {
  id: "msdRadix",
  name: "MSD 기수 정렬",
  category: "linear",
  desc: "가장 큰 자릿수부터 나누어 재귀 정렬",
  complexity: {
    best: "O(n)",
    average: "O(d·n)",
    worst: "O(d·n)",
    space: "O(n + d·10)",
  },
  stable: true,
  code: ALGO_CODE.msdRadix,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    let max = 0;
    for (let i = 0; i < n; i++) max = Math.max(max, t.value(i));
    let exp = 1;
    while (Math.floor(max / exp) >= 10) exp *= 10;
    msd(t, 0, n - 1, exp);
  },
};
