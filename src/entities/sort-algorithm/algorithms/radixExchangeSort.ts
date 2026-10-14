import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function radixExchangeSort(arr) {
  if (arr.length < 2) return arr;
  const max = Math.max(...arr);
  const topBit = max === 0 ? -1 : 31 - Math.clz32(max);
  sort(arr, 0, arr.length - 1, topBit);
  return arr;
}

// 가장 높은 비트부터, 0인 원소는 왼쪽 1인 원소는 오른쪽으로 (비트 단위 퀵 정렬)
function sort(arr, lo, hi, bit) {
  if (lo >= hi || bit < 0) return;
  let i = lo, j = hi;
  // [lo, i)는 0,  (j, hi]는 1
  while (i <= j) {
    if (((arr[i] >> bit) & 1) === 0) { //@read-left
      i++;
      continue;
    }
    if (((arr[j] >> bit) & 1) === 1) { //@read-right
      j--;
      continue;
    }
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
    i++;
    j--;
  }
  sort(arr, lo, j, bit - 1); // 0 묶음을 다음 비트로
  sort(arr, i, hi, bit - 1); // 1 묶음을 다음 비트로
}`);

const L = { readLeft: CODE.line("read-left"), readRight: CODE.line("read-right"), swap: CODE.line("swap") };

function radixExchange(t: Tracer, lo: number, hi: number, bit: number) {
  if (lo >= hi || bit < 0) return;
  const bitOf = (i: number) => (t.value(i) >> bit) & 1;
  let i = lo;
  let j = hi;
  while (i <= j) {
    t.mark(i, L.readLeft);
    if (bitOf(i) === 0) {
      i++;
      continue;
    }
    t.mark(j, L.readRight);
    if (bitOf(j) === 1) {
      j--;
      continue;
    }
    t.swap(i++, j--, L.swap);
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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    let max = 0;
    for (let i = 0; i < n; i++) max = Math.max(max, t.value(i));
    const topBit = max === 0 ? -1 : 31 - Math.clz32(max);
    radixExchange(t, 0, n - 1, topBit);
  },
};
