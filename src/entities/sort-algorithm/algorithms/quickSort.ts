import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

/** 마지막 원소를 피벗으로 하는 Lomuto 분할. 피벗의 최종 위치를 반환한다. */
export function lomutoPartition(
  t: Tracer,
  low: number,
  high: number,
  lines: { cmp: number; swap: number; swapPivot: number } = { cmp: 0, swap: 0, swapPivot: 0 }
) {
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (t.cmp(j, high, lines.cmp) < 0) {
      i++;
      t.swap(i, j, lines.swap);
    }
  }
  t.swap(i + 1, high, lines.swapPivot);
  return i + 1;
}

const CODE = defineCode(`function quickSort(arr) {
  // 재귀 대신 스택으로 정렬할 구간을 관리 (정렬된 입력에서도 안전)
  const stack = [[0, arr.length - 1]];
  while (stack.length > 0) {
    const [low, high] = stack.pop();
    if (low >= high) continue;
    const p = partition(arr, low, high);
    stack.push([p + 1, high], [low, p - 1]);
  }
  return arr;
}

// 마지막 원소를 피벗으로, 피벗보다 작은 값을 앞쪽으로 모은다 (Lomuto 분할)
function partition(arr, low, high) {
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < arr[high]) { //@cmp
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
    }
  }
  // 피벗을 작은 값들 바로 뒤로
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; //@swap-pivot
  return i + 1;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap"), swapPivot: CODE.line("swap-pivot") };

export const quickSort: SortAlgorithm = {
  id: "quick",
  name: "퀵 정렬",
  category: "standard",
  desc: "피벗을 기준으로 분할 정렬",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
  },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const stack: Array<[number, number]> = [[0, t.length - 1]];
    while (stack.length > 0) {
      const [low, high] = stack.pop()!;
      if (low >= high) continue;
      const p = lomutoPartition(t, low, high, L);
      stack.push([p + 1, high], [low, p - 1]);
    }
  },
};
