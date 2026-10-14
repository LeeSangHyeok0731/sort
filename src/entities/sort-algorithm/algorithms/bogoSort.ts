import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** 무한 루프를 막기 위한 안전 한도 */
export const BOGO_MAX_SHUFFLES = 5000;

function isSorted(t: Tracer) {
  for (let i = 0; i < t.length - 1; i++) {
    if (t.cmp(i, i + 1) > 0) return false;
  }
  return true;
}

export const bogoSort: SortAlgorithm = {
  id: "bogo",
  name: "보고 정렬",
  category: "fun",
  desc: "운이 좋을 때까지 무작위 섞기",
  complexity: { best: "O(n)", average: "O(n·n!)", worst: "∞", space: "O(1)" },
  stable: false,
  note: "섞기를 최대 5,000번까지만 시도해요. 원소가 7개부터 미완료가 나오기 시작하고, 8개 이상이면 대부분 미완료로 끝납니다.",
  code: ALGO_CODE.bogo,
  sort(t) {
    for (let shuffles = 0; !isSorted(t); shuffles++) {
      if (shuffles >= BOGO_MAX_SHUFFLES) {
        return true;
      }
      for (let i = t.length - 1; i > 0; i--) {
        t.swap(i, Math.floor(Math.random() * (i + 1)));
      }
    }
  },
};
