import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

/**
 * 정렬된 두 구간 [left, mid], [mid + 1, right]를 병합한다.
 * 오른쪽 원소가 더 작으면 왼쪽 원소 앞으로 move 하므로 id 중복 없이 안정적으로 병합된다.
 */
export function mergeRuns(
  t: Tracer,
  left: number,
  mid: number,
  right: number,
  lines: { cmp: number; move: number } = { cmp: 0, move: 0 }
) {
  let i = left;
  let j = mid + 1;
  while (i < j && j <= right) {
    if (t.cmp(j, i, lines.cmp) < 0) {
      t.move(j, i, lines.move);
      j++;
    }
    i++;
  }
}

const CODE = defineCode(`function mergeSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr;
  const mid = Math.floor((left + right) / 2);
  mergeSort(arr, left, mid);      // 왼쪽 절반 정렬
  mergeSort(arr, mid + 1, right); // 오른쪽 절반 정렬
  merge(arr, left, mid, right);   // 두 절반 병합
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

export const mergeSort: SortAlgorithm = {
  id: "merge",
  name: "병합 정렬",
  category: "standard",
  desc: "반으로 나누어 정렬 후 병합",
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
    const sort = (left: number, right: number) => {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      sort(left, mid);
      sort(mid + 1, right);
      mergeRuns(t, left, mid, right, L);
    };
    sort(0, t.length - 1);
  },
};
