import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`// "곱하고 항복하라(multiply and surrender)" 원칙의 패러디 정렬
function slowSort(arr, i = 0, j = arr.length - 1) {
  if (i >= j) return arr;
  const m = Math.floor((i + j) / 2);
  slowSort(arr, i, m);     // 앞 절반 정렬 → 그 최댓값이 m에
  slowSort(arr, m + 1, j); // 뒤 절반 정렬 → 그 최댓값이 j에
  // 둘 중 큰 값을 맨 끝으로
  if (arr[m] > arr[j]) { //@cmp
    [arr[m], arr[j]] = [arr[j], arr[m]]; //@swap
  }
  // 최댓값을 뺀 나머지를 처음부터 다시 정렬
  slowSort(arr, i, j - 1);
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

/** "곱하고 항복하라(multiply and surrender)": 최댓값을 찾고, 나머지를 다시 정렬한다 */
function slow(t: Tracer, i: number, j: number) {
  if (i >= j) return;
  const m = Math.floor((i + j) / 2);
  slow(t, i, m);
  slow(t, m + 1, j);
  if (t.cmp(m, j, L.cmp) > 0) t.swap(m, j, L.swap);
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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    slow(t, 0, t.length - 1);
  },
};
