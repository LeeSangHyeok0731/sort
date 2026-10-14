import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

/** 사용자 간격을 정리한다. 마지막 간격이 1이 아니면 1을 덧붙여 항상 정렬이 끝나도록 한다. */
export function normalizeGaps(gaps: number[] | undefined, n: number): number[] {
  const valid = [...new Set((gaps ?? []).filter((g) => Number.isInteger(g) && g > 0 && g < n))]
    .sort((a, b) => b - a);
  if (valid.length === 0) {
    const defaults: number[] = [];
    for (let g = Math.floor(n / 2); g > 0; g = Math.floor(g / 2)) defaults.push(g);
    return defaults;
  }
  if (valid[valid.length - 1] !== 1) valid.push(1);
  return valid;
}

const CODE = defineCode(`// gaps: 큰 값부터 줄어드는 간격 수열 (마지막은 반드시 1)
// 비워 두면 n/2, n/4, ..., 1
function shellSort(arr, gaps = defaultGaps(arr.length)) {
  const n = arr.length;
  for (const gap of gaps) {
    // gap만큼 떨어진 원소끼리 삽입 정렬
    for (let i = gap; i < n; i++) {
      for (let j = i; j >= gap && arr[j - gap] > arr[j]; j -= gap) { //@cmp
        [arr[j - gap], arr[j]] = [arr[j], arr[j - gap]]; //@swap
      }
    }
  }
  return arr;
}

function defaultGaps(n) {
  const gaps = [];
  for (let g = Math.floor(n / 2); g > 0; g = Math.floor(g / 2)) gaps.push(g);
  return gaps;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const shellSort: SortAlgorithm = {
  id: "shell",
  name: "셸 정렬",
  category: "standard",
  desc: "간격을 조절하며 삽입 정렬",
  complexity: {
    best: "O(n log n)",
    average: "간격에 따라 다름",
    worst: "O(n²)",
    space: "O(1)",
  },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t, { shellGaps }) {
    const n = t.length;
    for (const gap of normalizeGaps(shellGaps, n)) {
      for (let i = gap; i < n; i++) {
        for (let j = i; j >= gap && t.cmp(j - gap, j, L.cmp) > 0; j -= gap) {
          t.swap(j - gap, j, L.swap);
        }
      }
    }
  },
};
