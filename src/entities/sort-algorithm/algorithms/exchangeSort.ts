import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function exchangeSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // i번째 자리와 그 뒤 모든 원소를 비교해 더 작으면 바로 교환
    for (let j = i + 1; j < n; j++) {
      if (arr[i] > arr[j]) { //@cmp
        [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
      }
    }
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const exchangeSort: SortAlgorithm = {
  id: "exchange",
  name: "교환 정렬",
  category: "standard",
  desc: "i번째와 그 뒤 모든 원소를 비교해 바로 교환",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (t.cmp(i, j, L.cmp) > 0) t.swap(i, j, L.swap);
      }
    }
  },
};
