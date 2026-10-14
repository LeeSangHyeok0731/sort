import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { insertionSortRange } from "./insertionSort";

/**
 * 원소마다 key(i)로 구한 칸에 속하도록 [lo, lo + Σcounts) 구간을 교환만으로 재배치한다.
 * 각 칸의 쓰기 위치(next)가 칸 끝에 닿을 때까지, 잘못된 칸의 원소를 제 칸으로 던진다.
 */
export function permuteIntoBuckets(
  t: Tracer,
  lo: number,
  counts: readonly number[],
  key: (i: number) => number,
  lines: { read: number; swap: number } = { read: 0, swap: 0 }
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
      t.mark(next[k], lines.read);
      const target = key(next[k]);
      if (target === k) next[k]++;
      else t.swap(next[k], next[target]++, lines.swap);
    }
  }
}

const CODE = defineCode(`function flashSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // 1) 최솟값·최댓값의 위치
  let min = 0, max = 0;
  for (let i = 1; i < n; i++) {
    if (arr[i] < arr[min]) min = i; //@cmp-min
    if (arr[i] > arr[max]) max = i; //@cmp-max
  }
  const lo = arr[min], range = arr[max] - lo;
  if (range === 0) return arr;
  // 2) 값의 분포로 m개 칸 중 어디에 들어갈지 예측 (m ≈ 0.43n)
  const m = Math.max(2, Math.floor(0.43 * n));
  const cls = (x) => Math.floor(((m - 1) * (x - lo)) / range);
  const count = new Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    const c = cls(arr[i]); //@read-count
    count[c]++;
  }
  // 3) 칸별 쓰기 위치를 정하고, 잘못된 칸의 원소를 제 칸으로 던진다
  const next = [], end = [];
  for (let k = 0, pos = 0; k < m; k++) {
    next.push(pos);
    pos += count[k];
    end.push(pos);
  }
  for (let k = 0; k < m; k++) {
    while (next[k] < end[k]) {
      const target = cls(arr[next[k]]); //@read-class
      if (target === k) next[k]++;
      else {
        const j = next[target]++;
        [arr[next[k]], arr[j]] = [arr[j], arr[next[k]]]; //@swap-throw
      }
    }
  }
  // 4) 대부분 제자리 근처이므로 삽입 정렬로 마무리
  for (let i = 1; i < n; i++) {
    for (let j = i; j > 0 && arr[j - 1] > arr[j]; j--) { //@cmp
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap
    }
  }
  return arr;
}`);

const L = {
  cmpMin: CODE.line("cmp-min"),
  cmpMax: CODE.line("cmp-max"),
  readCount: CODE.line("read-count"),
  readClass: CODE.line("read-class"),
  swapThrow: CODE.line("swap-throw"),
  cmp: CODE.line("cmp"),
  swap: CODE.line("swap"),
};

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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    let min = 0;
    let max = 0;
    for (let i = 1; i < n; i++) {
      if (t.cmp(i, min, L.cmpMin) < 0) min = i;
      if (t.cmp(i, max, L.cmpMax) > 0) max = i;
    }
    const minValue = t.value(min);
    const range = t.value(max) - minValue;
    if (range === 0) return;

    const m = Math.max(2, Math.floor(0.43 * n));
    const classOf = (i: number) => Math.floor(((m - 1) * (t.value(i) - minValue)) / range);

    const counts = new Array(m).fill(0);
    for (let i = 0; i < n; i++) {
      t.mark(i, L.readCount);
      counts[classOf(i)]++;
    }
    permuteIntoBuckets(t, 0, counts, classOf, { read: L.readClass, swap: L.swapThrow });
    insertionSortRange(t, 0, n - 1, L);
  },
};
