import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

/** [left, right] 구간을 인접 교환 방식의 삽입 정렬로 정렬한다. lines: 설명 코드 줄 번호 (선택) */
export function insertionSortRange(
  t: Tracer,
  left: number,
  right: number,
  lines: { cmp: number; swap: number } = { cmp: 0, swap: 0 }
) {
  for (let i = left + 1; i <= right; i++) {
    for (let j = i; j > left && t.cmp(j - 1, j, lines.cmp) > 0; j--) {
      t.swap(j - 1, j, lines.swap);
    }
  }
}

const CODE = defineCode(`function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    // arr[i]를 왼쪽의 정렬된 부분에서 제자리를 찾을 때까지
    // 왼쪽 이웃과 비교하며 교환해 내려보낸다
    for (let j = i; j > 0 && arr[j - 1] > arr[j]; j--) { //@cmp
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap
    }
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const insertionSort: SortAlgorithm = {
  id: "insertion",
  name: "삽입 정렬",
  category: "standard",
  desc: "정렬된 부분에 요소를 삽입",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    insertionSortRange(t, 0, t.length - 1, L);
  },
};
