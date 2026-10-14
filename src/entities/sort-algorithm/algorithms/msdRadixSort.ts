import type { ArrayItem } from "@/shared/model";
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function msdRadixSort(arr) {
  if (arr.length < 2) return arr;
  const max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) >= 10) exp *= 10;
  msd(arr, 0, arr.length - 1, exp);
  return arr;
}

// 가장 큰 자릿수부터: 현재 자릿수로 10개 묶음에 나누고, 묶음마다 다음 자릿수로
function msd(arr, lo, hi, exp) {
  if (hi <= lo || exp < 1) return;
  const groups = Array.from({ length: 10 }, () => []);
  for (let i = lo; i <= hi; i++) {
    const d = Math.floor(arr[i] / exp) % 10; //@read
    groups[d].push(arr[i]);
  }
  // 묶음 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  const order = groups.flat();
  for (let k = 0; k < order.length; k++) {
    const from = arr.indexOf(order[k], lo + k);
    arr.splice(lo + k, 0, ...arr.splice(from, 1)); //@move
  }
  let start = lo;
  for (const g of groups) {
    msd(arr, start, start + g.length - 1, exp / 10);
    start += g.length;
  }
}`);

const L = { read: CODE.line("read"), move: CODE.line("move") };

/** [lo, hi] 구간을 exp 자릿수로 나누고, 각 묶음을 다음 자릿수로 재귀 정렬한다. */
function msd(t: Tracer, lo: number, hi: number, exp: number) {
  if (hi <= lo || exp < 1) return;

  const digit = (i: number) => Math.floor(t.value(i) / exp) % 10;
  const groups: ArrayItem[][] = Array.from({ length: 10 }, () => []);
  for (let i = lo; i <= hi; i++) {
    t.mark(i, L.read);
    groups[digit(i)].push(t.item(i));
  }
  t.arrange(lo, groups.flat(), L.move);

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
  code: CODE.code,
  codeLabels: CODE.labels,
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
