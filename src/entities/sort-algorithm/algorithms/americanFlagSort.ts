import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { permuteIntoBuckets } from "./flashSort";
import { insertionSortRange } from "./insertionSort";

const SMALL = 8;

const CODE = defineCode(`function americanFlagSort(arr) {
  if (arr.length < 2) return arr;
  const max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) >= 10) exp *= 10;
  flag(arr, 0, arr.length - 1, exp);
  return arr;
}

function flag(arr, lo, hi, exp) {
  if (hi - lo < 1 || exp < 1) return;
  // 작은 구간은 삽입 정렬
  if (hi - lo + 1 <= 8) {
    for (let i = lo + 1; i <= hi; i++) {
      for (let j = i; j > lo && arr[j - 1] > arr[j]; j--) { //@cmp
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap
      }
    }
    return;
  }
  const digit = (x) => Math.floor(x / exp) % 10;
  // 1) 자릿수(0~9)별 개수 → 각 칸의 시작·끝
  const count = new Array(10).fill(0);
  for (let i = lo; i <= hi; i++) {
    const d = digit(arr[i]); //@read-count
    count[d]++;
  }
  const next = [], end = [];
  for (let d = 0, pos = lo; d < 10; d++) {
    next.push(pos);
    pos += count[d];
    end.push(pos);
  }
  // 2) 보조 배열 없이 교환만으로 원소를 제 칸에 넣는다
  for (let d = 0; d < 10; d++) {
    while (next[d] < end[d]) {
      const target = digit(arr[next[d]]); //@read-digit
      if (target === d) next[d]++;
      else {
        const j = next[target]++;
        [arr[next[d]], arr[j]] = [arr[j], arr[next[d]]]; //@swap-throw
      }
    }
  }
  // 3) 각 칸을 다음 자릿수로
  for (let d = 0, start = lo; d < 10; d++) {
    flag(arr, start, start + count[d] - 1, exp / 10);
    start += count[d];
  }
}`);

const L = {
  cmp: CODE.line("cmp"),
  swap: CODE.line("swap"),
  readCount: CODE.line("read-count"),
  readDigit: CODE.line("read-digit"),
  swapThrow: CODE.line("swap-throw"),
};

function flag(t: Tracer, lo: number, hi: number, exp: number) {
  if (hi - lo < 1 || exp < 1) return;
  if (hi - lo + 1 <= SMALL) {
    insertionSortRange(t, lo, hi, L);
    return;
  }
  const digit = (i: number) => Math.floor(t.value(i) / exp) % 10;
  const counts = new Array(10).fill(0);
  for (let i = lo; i <= hi; i++) {
    t.mark(i, L.readCount);
    counts[digit(i)]++;
  }
  permuteIntoBuckets(t, lo, counts, digit, { read: L.readDigit, swap: L.swapThrow });
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
  code: CODE.code,
  codeLabels: CODE.labels,
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
