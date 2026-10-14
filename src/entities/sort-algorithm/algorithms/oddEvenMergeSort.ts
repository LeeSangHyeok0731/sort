import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const oddEvenMergeSort: SortAlgorithm = {
  id: "oddEvenMerge",
  name: "배처 홀짝 병합 정렬",
  category: "special",
  desc: "비교 위치가 미리 정해진 정렬 네트워크",
  complexity: {
    best: "O(n log² n)",
    average: "O(n log² n)",
    worst: "O(n log² n)",
    space: "O(1)",
  },
  stable: false,
  code: ALGO_CODE.oddEvenMerge,
  sort(t) {
    const n = t.length;
    // 2의 거듭제곱 크기 네트워크에서 n 이상 위치는 +∞로 채운 것으로 본다.
    // (+∞는 항상 뒤쪽 인덱스에 있으므로 그 비교는 교환이 일어나지 않아 건너뛰어도 된다)
    for (let p = 1; p < n; p *= 2) {
      for (let k = p; k >= 1; k = Math.floor(k / 2)) {
        for (let j = k % p; j + k < n; j += 2 * k) {
          for (let i = 0; i < k && i + j + k < n; i++) {
            // 같은 2p 블록 안의 쌍만 비교
            if (Math.floor((i + j) / (2 * p)) === Math.floor((i + j + k) / (2 * p))) {
              if (t.cmp(i + j, i + j + k) > 0) t.swap(i + j, i + j + k);
            }
          }
        }
      }
    }
  },
};
