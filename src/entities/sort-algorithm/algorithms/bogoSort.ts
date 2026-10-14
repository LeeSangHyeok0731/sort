import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { opCount } from "../model/op";
import { ALGO_CODE } from "./code";

/** 무한 루프를 막기 위한 안전 한도 */
export const BOGO_MAX_SHUFFLES = 5000;
export const BOGO_MAX_OPS = 3_000_000;

function isSorted(t: Tracer) {
  for (let i = 0; i < t.length - 1; i++) {
    if (t.cmp(i, i + 1) > 0) return false;
  }
  return true;
}

export const bogoSort: SortAlgorithm = {
  id: "bogo",
  name: "보고 정렬",
  category: "special",
  desc: "운이 좋을 때까지 무작위 섞기",
  complexity: { best: "O(n)", average: "O(n·n!)", worst: "∞", space: "O(1)" },
  stable: false,
  code: ALGO_CODE.bogo,
  sort(t) {
    for (let shuffles = 0; !isSorted(t); shuffles++) {
      if (shuffles >= BOGO_MAX_SHUFFLES || opCount(t.ops) >= BOGO_MAX_OPS) {
        return true;
      }
      for (let i = t.length - 1; i > 0; i--) {
        t.swap(i, Math.floor(Math.random() * (i + 1)));
      }
    }
  },
};
