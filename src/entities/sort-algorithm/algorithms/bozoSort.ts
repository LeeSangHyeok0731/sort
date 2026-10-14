import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** 무한 루프를 막기 위한 안전 한도 */
export const BOZO_MAX_SWAPS = 50_000;

function isSorted(t: Tracer) {
  for (let i = 0; i < t.length - 1; i++) {
    if (t.cmp(i, i + 1) > 0) return false;
  }
  return true;
}

export const bozoSort: SortAlgorithm = {
  id: "bozo",
  name: "보조 정렬",
  category: "fun",
  desc: "아무 두 개나 바꾸고 정렬됐는지 확인",
  complexity: { best: "O(n)", average: "O(n·n!)", worst: "∞", space: "O(1)" },
  stable: false,
  note: "무작위 교환을 최대 50,000번까지만 시도해요. 원소가 8개부터 미완료가 나오기 시작하고, 9개 이상이면 대부분 미완료로 끝납니다.",
  code: ALGO_CODE.bozo,
  sort(t) {
    const n = t.length;
    for (let swaps = 0; !isSorted(t); swaps++) {
      if (swaps >= BOZO_MAX_SWAPS) return true;
      const i = Math.floor(Math.random() * n);
      let j = Math.floor(Math.random() * (n - 1));
      if (j >= i) j++; // 서로 다른 두 위치
      t.swap(i, j);
    }
  },
};
