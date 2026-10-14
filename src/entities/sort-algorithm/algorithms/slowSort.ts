import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** "곱하고 항복하라(multiply and surrender)": 최댓값을 찾고, 나머지를 다시 정렬한다 */
function slow(t: Tracer, i: number, j: number) {
  if (i >= j) return;
  const m = Math.floor((i + j) / 2);
  slow(t, i, m);
  slow(t, m + 1, j);
  if (t.cmp(m, j) > 0) t.swap(m, j); // 두 절반의 최댓값 중 큰 쪽을 맨 끝으로
  slow(t, i, j - 1);
}

export const slowSort: SortAlgorithm = {
  id: "slow",
  name: "슬로우 정렬",
  category: "fun",
  desc: "일부러 최대한 느리게 만든 패러디 정렬",
  complexity: {
    best: "Ω(n^(log n/(2+ε)))",
    average: "Ω(n^(log n/(2+ε)))",
    worst: "Ω(n^(log n/(2+ε)))",
    space: "O(n)",
  },
  stable: false,
  note: "다항 시간보다 느려요. 약 100개를 넘으면 연산 한도(300만)에 걸려 미완료로 끝납니다.",
  code: ALGO_CODE.slow,
  sort(t) {
    slow(t, 0, t.length - 1);
  },
};
