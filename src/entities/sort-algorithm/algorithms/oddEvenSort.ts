import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function oddEvenSort(arr) {
  const n = arr.length;
  let sorted = false;
  while (!sorted) {
    sorted = true;
    // 홀수 쌍(1-2, 3-4, ...)과 짝수 쌍(0-1, 2-3, ...)을 번갈아 비교
    // 각 패스의 비교는 서로 겹치지 않아 병렬로 처리할 수 있다
    for (const start of [1, 0]) {
      for (let i = start; i + 1 < n; i += 2) {
        if (arr[i] > arr[i + 1]) { //@cmp
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; //@swap
          sorted = false;
        }
      }
    }
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const oddEvenSort: SortAlgorithm = {
  id: "oddEven",
  name: "오드-이븐 정렬",
  category: "special",
  desc: "홀수/짝수 위치 교차 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    let sorted = false;
    while (!sorted) {
      sorted = true;
      for (const start of [1, 0]) {
        for (let i = start; i + 1 < n; i += 2) {
          if (t.cmp(i, i + 1, L.cmp) > 0) {
            t.swap(i, i + 1, L.swap);
            sorted = false;
          }
        }
      }
    }
  },
};
