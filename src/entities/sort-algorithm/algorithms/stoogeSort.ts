import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

function stooge(t: Tracer, i: number, j: number) {
  if (t.cmp(i, j) > 0) t.swap(i, j);
  const len = j - i + 1;
  if (len <= 2) return;
  const third = Math.floor(len / 3);
  stooge(t, i, j - third); // 앞 2/3
  stooge(t, i + third, j); // 뒤 2/3
  stooge(t, i, j - third); // 다시 앞 2/3
}

export const stoogeSort: SortAlgorithm = {
  id: "stooge",
  name: "스투지 정렬",
  category: "fun",
  desc: "앞 2/3, 뒤 2/3, 다시 앞 2/3을 정렬",
  complexity: {
    best: "O(n^2.71)",
    average: "O(n^2.71)",
    worst: "O(n^2.71)",
    space: "O(log n)",
  },
  stable: false,
  note: "버블 정렬보다도 느려요. 약 300개를 넘으면 연산 한도(300만)에 걸려 미완료로 끝납니다.",
  code: ALGO_CODE.stooge,
  sort(t) {
    if (t.length >= 2) stooge(t, 0, t.length - 1);
  },
};
