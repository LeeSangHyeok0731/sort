import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { insertionSortRange } from "./insertionSort";
import { ALGO_CODE } from "./code";

/**
 * 원소마다 key(i)로 구한 칸에 속하도록 [lo, lo + Σcounts) 구간을 교환만으로 재배치한다.
 * 각 칸의 쓰기 위치(next)가 칸 끝에 닿을 때까지, 잘못된 칸의 원소를 제 칸으로 던진다.
 */
export function permuteIntoBuckets(
  t: Tracer,
  lo: number,
  counts: readonly number[],
  key: (i: number) => number
) {
  const next: number[] = [];
  const end: number[] = [];
  let pos = lo;
  for (const c of counts) {
    next.push(pos);
    pos += c;
    end.push(pos);
  }
  for (let k = 0; k < counts.length; k++) {
    while (next[k] < end[k]) {
      t.mark(next[k]);
      const target = key(next[k]);
      if (target === k) next[k]++;
      else t.swap(next[k], next[target]++);
    }
  }
}

export const flashSort: SortAlgorithm = {
  id: "flash",
  name: "플래시 정렬",
  category: "linear",
  desc: "값의 분포로 위치를 예측해 칸에 던져 넣음",
  complexity: {
    best: "O(n)",
    average: "O(n)",
    worst: "O(n²)",
    space: "O(m)",
  },
  stable: false,
  code: ALGO_CODE.flash,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    let min = 0;
    let max = 0;
    for (let i = 1; i < n; i++) {
      if (t.cmp(i, min) < 0) min = i;
      if (t.cmp(i, max) > 0) max = i;
    }
    const minValue = t.value(min);
    const range = t.value(max) - minValue;
    if (range === 0) return;

    // 칸 수 m ≈ 0.43n (원 논문의 권장값)
    const m = Math.max(2, Math.floor(0.43 * n));
    const classOf = (i: number) => Math.floor(((m - 1) * (t.value(i) - minValue)) / range);

    const counts = new Array(m).fill(0);
    for (let i = 0; i < n; i++) {
      t.mark(i);
      counts[classOf(i)]++;
    }
    permuteIntoBuckets(t, 0, counts, classOf);
    // 칸 안은 대부분 몇 개뿐이라 삽입 정렬로 마무리
    insertionSortRange(t, 0, n - 1);
  },
};
