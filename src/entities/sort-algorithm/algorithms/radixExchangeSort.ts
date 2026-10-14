import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** bit번째 비트로 [lo, hi]를 0 묶음 | 1 묶음으로 나누고 다음 비트로 재귀 (비트 단위 퀵 정렬) */
function radixExchange(t: Tracer, lo: number, hi: number, bit: number) {
  if (lo >= hi || bit < 0) return;
  const bitOf = (i: number) => (t.value(i) >> bit) & 1;
  let i = lo;
  let j = hi;
  // 불변식: [lo, i)는 0, (j, hi]는 1
  while (i <= j) {
    t.mark(i);
    if (bitOf(i) === 0) {
      i++;
      continue;
    }
    t.mark(j);
    if (bitOf(j) === 1) {
      j--;
      continue;
    }
    t.swap(i++, j--);
  }
  radixExchange(t, lo, j, bit - 1);
  radixExchange(t, i, hi, bit - 1);
}

export const radixExchangeSort: SortAlgorithm = {
  id: "radixExchange",
  name: "기수 교환 정렬",
  category: "linear",
  desc: "비트 단위로 0과 1을 나누는 이진 퀵 정렬",
  complexity: {
    best: "O(b·n)",
    average: "O(b·n)",
    worst: "O(b·n)",
    space: "O(b)",
  },
  stable: false,
  code: ALGO_CODE.radixExchange,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    let max = 0;
    for (let i = 0; i < n; i++) max = Math.max(max, t.value(i));
    const topBit = max === 0 ? -1 : 31 - Math.clz32(max);
    radixExchange(t, 0, n - 1, topBit);
  },
};
