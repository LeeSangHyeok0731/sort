import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    // 끝에서부터 i개는 이미 정렬됨
    for (let j = 0; j < n - i - 1; j++) {
      // 인접한 두 원소를 비교해 큰 값을 뒤로
      if (arr[j] > arr[j + 1]) { //@cmp
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; //@swap
        swapped = true;
      }
    }
    // 한 바퀴 동안 교환이 없으면 이미 정렬된 것
    if (!swapped) break;
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const bubbleSort: SortAlgorithm = {
  id: "bubble",
  name: "버블 정렬",
  category: "standard",
  desc: "인접한 두 항을 비교하며 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        if (t.cmp(j, j + 1, L.cmp) > 0) {
          t.swap(j, j + 1, L.swap);
          swapped = true;
        }
      }
      if (!swapped) break;
    }
  },
};
