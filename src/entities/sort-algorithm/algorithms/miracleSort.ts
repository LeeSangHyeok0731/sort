import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

/** 기적을 기다리는 횟수 */
export const MIRACLE_MAX_CHECKS = 10;

export const miracleSort: SortAlgorithm = {
  id: "miracle",
  name: "기적 정렬",
  category: "fun",
  desc: "배열이 저절로 정렬되기를 기다림",
  complexity: { best: "O(n)", average: "∞", worst: "∞", space: "O(1)" },
  stable: true,
  note: "배열을 전혀 바꾸지 않아요. 이미 정렬된 배열이 아니면 기적은 일어나지 않습니다.",
  code: ALGO_CODE.miracle,
  sort(t) {
    for (let check = 0; check < MIRACLE_MAX_CHECKS; check++) {
      let sorted = true;
      for (let i = 0; i < t.length - 1 && sorted; i++) {
        if (t.cmp(i, i + 1) > 0) sorted = false;
      }
      if (sorted) return;
      // ...우주선이 비트를 뒤집어 주기를 기도하며 다시 확인
    }
    return true;
  },
};
