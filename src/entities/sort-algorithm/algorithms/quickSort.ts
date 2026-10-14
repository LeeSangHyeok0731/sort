import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** 마지막 원소를 피벗으로 하는 Lomuto 분할. 피벗의 최종 위치를 반환한다. */
export function lomutoPartition(t: Tracer, low: number, high: number) {
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (t.cmp(j, high) < 0) {
      i++;
      t.swap(i, j);
    }
  }
  t.swap(i + 1, high);
  return i + 1;
}

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
  code: ALGO_CODE.quick,
  sort(t) {
    // 정렬된 입력에서 재귀가 깊어지지 않도록 명시적 스택 사용
    const stack: Array<[number, number]> = [[0, t.length - 1]];
    while (stack.length > 0) {
      const [low, high] = stack.pop()!;
      if (low >= high) continue;
      const p = lomutoPartition(t, low, high);
      stack.push([p + 1, high], [low, p - 1]);
    }
  },
};
