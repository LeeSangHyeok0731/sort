import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`// Batcher의 홀짝 병합 정렬 네트워크 (반복 버전)
// 어떤 위치끼리 비교할지가 입력과 무관하게 미리 정해져 있다.
// n이 2의 거듭제곱이 아니면 뒤를 +∞로 채운 것처럼 범위 밖 비교를 건너뛴다
function oddEvenMergeSort(arr) {
  const n = arr.length;
  for (let p = 1; p < n; p *= 2) {
    for (let k = p; k >= 1; k = Math.floor(k / 2)) {
      for (let j = k % p; j + k < n; j += 2 * k) {
        for (let i = 0; i < k && i + j + k < n; i++) {
          const a = i + j, b = i + j + k;
          // 같은 2p 크기 블록 안에 있는 쌍만 비교-교환
          if (Math.floor(a / (2 * p)) !== Math.floor(b / (2 * p))) continue;
          if (arr[a] > arr[b]) { //@cmp
            [arr[a], arr[b]] = [arr[b], arr[a]]; //@swap
          }
        }
      }
    }
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let p = 1; p < n; p *= 2) {
      for (let k = p; k >= 1; k = Math.floor(k / 2)) {
        for (let j = k % p; j + k < n; j += 2 * k) {
          for (let i = 0; i < k && i + j + k < n; i++) {
            const a = i + j;
            const b = i + j + k;
            if (Math.floor(a / (2 * p)) !== Math.floor(b / (2 * p))) continue;
            if (t.cmp(a, b, L.cmp) > 0) t.swap(a, b, L.swap);
          }
        }
      }
    }
  },
};
