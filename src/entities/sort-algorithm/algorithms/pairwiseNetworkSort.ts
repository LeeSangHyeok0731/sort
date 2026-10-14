import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

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
  code: ALGO_CODE.pairwise,
  sort(t) {
    const n = t.length;
    let size = 1;
    while (size < n) size *= 2;
    // n 이상 위치는 +∞로 채운 것으로 보고 그 비교는 건너뛴다 (배처 정렬과 같은 방식)
    for (const [i, j] of pairwiseComparators(size)) {
      if (j < n && t.cmp(i, j) > 0) t.swap(i, j);
    }
  },
};
