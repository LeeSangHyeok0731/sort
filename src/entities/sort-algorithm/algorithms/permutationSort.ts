import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

function isSorted(t: Tracer) {
  for (let i = 0; i < t.length - 1; i++) {
    if (t.cmp(i, i + 1) > 0) return false;
  }
  return true;
}

export const permutationSort: SortAlgorithm = {
  id: "permutation",
  name: "순열 정렬",
  category: "fun",
  desc: "가능한 모든 순서를 하나씩 다 시도",
  complexity: { best: "O(n)", average: "O(n·n!)", worst: "O(n·n!)", space: "O(n)" },
  stable: false,
  note: "보고 정렬과 달리 언젠가는 반드시 끝나요. 9개까지는 한도 안에 끝나지만, 10개부터는 대부분 연산 한도(300만)에 걸려 미완료로 끝납니다.",
  code: ALGO_CODE.permutation,
  sort(t) {
    if (isSorted(t)) return;
    // Heap 알고리즘: 교환 한 번마다 새로운 순열이 하나씩 만들어진다
    const n = t.length;
    const c = new Array(n).fill(0);
    let i = 1;
    while (i < n) {
      if (c[i] < i) {
        t.swap(i % 2 === 0 ? 0 : c[i], i);
        if (isSorted(t)) return;
        c[i]++;
        i = 1;
      } else {
        c[i] = 0;
        i++;
      }
    }
  },
};
