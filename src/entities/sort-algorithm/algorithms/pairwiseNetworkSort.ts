import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

/**
 * Parberry의 페어와이즈 정렬 네트워크 비교 쌍 (size는 2의 거듭제곱).
 * 1단계: 쌍 → 쌍의 쌍 … 순으로 앞 절반 ≤ 뒤 절반이 되게 비교.
 * 2단계: 간격을 줄여 가며 남은 어긋남을 바로잡는다.
 */
function* pairwiseComparators(size: number): Generator<[number, number]> {
  let a = 1;
  for (; a < size; a *= 2) {
    for (let b = a, c = 0; b < size; ) {
      yield [b - a, b];
      b++;
      c = (c + 1) % a;
      if (c === 0) b += a;
    }
  }
  a = Math.floor(a / 4);
  for (let e = 1; a > 0; a = Math.floor(a / 2), e = e * 2 + 1) {
    for (let d = e; d > 0; d = Math.floor(d / 2)) {
      for (let b = (d + 1) * a, c = 0; b < size; ) {
        yield [b - d * a, b];
        b++;
        c = (c + 1) % a;
        if (c === 0) b += a;
      }
    }
  }
}

const CODE = defineCode(`// Parberry의 페어와이즈 정렬 네트워크
// n이 2의 거듭제곱이 아니면, 뒤를 +∞로 채운 것처럼 범위 밖 비교를 건너뛴다
function pairwiseSort(arr) {
  const n = arr.length;
  let size = 1;
  while (size < n) size *= 2;
  const cmpSwap = (i, j) => {
    if (j >= n) return;
    if (arr[i] > arr[j]) { //@cmp
      [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
    }
  };

  // 1단계: 쌍 → 쌍의 쌍 → ... (각 블록의 앞 절반 ≤ 뒤 절반)
  let a = 1;
  for (; a < size; a *= 2) {
    for (let b = a, c = 0; b < size; ) {
      cmpSwap(b - a, b);
      b++;
      c = (c + 1) % a;
      if (c === 0) b += a;
    }
  }
  // 2단계: 간격을 줄여 가며 남은 어긋남을 바로잡는다
  a = Math.floor(a / 4);
  for (let e = 1; a > 0; a = Math.floor(a / 2), e = e * 2 + 1) {
    for (let d = e; d > 0; d = Math.floor(d / 2)) {
      for (let b = (d + 1) * a, c = 0; b < size; ) {
        cmpSwap(b - d * a, b);
        b++;
        c = (c + 1) % a;
        if (c === 0) b += a;
      }
    }
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const pairwiseNetworkSort: SortAlgorithm = {
  id: "pairwise",
  name: "페어와이즈 정렬 네트워크",
  category: "special",
  desc: "쌍을 묶어 올라가는 또 다른 정렬 네트워크",
  complexity: {
    best: "O(n log² n)",
    average: "O(n log² n)",
    worst: "O(n log² n)",
    space: "O(1)",
  },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    let size = 1;
    while (size < n) size *= 2;
    for (const [i, j] of pairwiseComparators(size)) {
      if (j < n && t.cmp(i, j, L.cmp) > 0) t.swap(i, j, L.swap);
    }
  },
};
