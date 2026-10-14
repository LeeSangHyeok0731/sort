import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import { mergeRuns } from "./mergeSort";

const CODE = defineCode(`function bottomUpMergeSort(arr) {
  const n = arr.length;
  // 크기 1짜리 구간들을 병합 → 2 → 4 → ... (재귀 없음)
  for (let width = 1; width < n; width *= 2) {
    for (let left = 0; left + width < n; left += 2 * width) {
      merge(arr, left, left + width - 1, Math.min(left + 2 * width - 1, n - 1));
    }
  }
  return arr;
}

// 보조 배열 없이 병합: 오른쪽 원소가 더 작으면
// 꺼내서 왼쪽 원소 앞에 끼워 넣는다 (같으면 그대로 → 안정 정렬)
function merge(arr, left, mid, right) {
  let i = left, j = mid + 1;
  while (i < j && j <= right) {
    if (arr[j] < arr[i]) { //@cmp
      arr.splice(i, 0, ...arr.splice(j, 1)); //@move
      j++;
    }
    i++;
  }
}`);

const L = { cmp: CODE.line("cmp"), move: CODE.line("move") };

export const bottomUpMergeSort: SortAlgorithm = {
  id: "bottomUpMerge",
  name: "상향식 병합 정렬",
  category: "standard",
  desc: "재귀 없이 크기 1, 2, 4… 구간을 차례로 병합",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
  },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let width = 1; width < n; width *= 2) {
      for (let left = 0; left + width < n; left += 2 * width) {
        mergeRuns(t, left, left + width - 1, Math.min(left + 2 * width - 1, n - 1), L);
      }
    }
  },
};
