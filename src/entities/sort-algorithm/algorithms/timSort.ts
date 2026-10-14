import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import { insertionSortRange } from "./insertionSort";
import { mergeRuns } from "./mergeSort";

const MIN_MERGE = 32;

export function minRunLength(n: number): number {
  let r = 0;
  while (n >= MIN_MERGE) {
    r |= n & 1;
    n >>= 1;
  }
  return n + r;
}

const CODE = defineCode(`function timSort(arr) {
  const n = arr.length;
  const minRun = minRunLength(n);
  // 1) minRun 크기 구간마다 삽입 정렬로 "런"을 만든다
  for (let i = 0; i < n; i += minRun) {
    const right = Math.min(i + minRun - 1, n - 1);
    for (let k = i + 1; k <= right; k++) {
      for (let j = k; j > i && arr[j - 1] > arr[j]; j--) { //@cmp-insert
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap-insert
      }
    }
  }
  // 2) 런을 두 배씩 키워 가며 병합
  for (let size = minRun; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = left + size - 1;
      const right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) merge(arr, left, mid, right);
    }
  }
  return arr;
}

// n을 반씩 줄이다가 32 미만이 되면 멈춘다 (중간에 홀수였던 적이 있으면 +1)
function minRunLength(n) {
  let r = 0;
  while (n >= 32) {
    r |= n & 1;
    n >>= 1;
  }
  return n + r;
}

// 보조 배열 없이 병합: 오른쪽 원소가 더 작으면 꺼내서 왼쪽 원소 앞에 끼워 넣는다
function merge(arr, left, mid, right) {
  let i = left, j = mid + 1;
  while (i < j && j <= right) {
    if (arr[j] < arr[i]) { //@cmp-merge
      arr.splice(i, 0, ...arr.splice(j, 1)); //@move-merge
      j++;
    }
    i++;
  }
}`);

const L = {
  insert: { cmp: CODE.line("cmp-insert"), swap: CODE.line("swap-insert") },
  merge: { cmp: CODE.line("cmp-merge"), move: CODE.line("move-merge") },
};

export const timSort: SortAlgorithm = {
  id: "tim",
  name: "팀 정렬",
  category: "special",
  desc: "삽입 + 병합 하이브리드",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
  },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    const minRun = minRunLength(n);

    for (let i = 0; i < n; i += minRun) {
      insertionSortRange(t, i, Math.min(i + minRun - 1, n - 1), L.insert);
    }
    for (let size = minRun; size < n; size *= 2) {
      for (let left = 0; left < n; left += 2 * size) {
        const mid = left + size - 1;
        const right = Math.min(left + 2 * size - 1, n - 1);
        if (mid < right) mergeRuns(t, left, mid, right, L.merge);
      }
    }
  },
};
