import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const cocktailSort: SortAlgorithm = {
  id: "cocktail",
  name: "칵테일 정렬",
  category: "special",
  desc: "양방향 버블 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: ALGO_CODE.cocktail,
  sort(t) {
    let start = 0;
    let end = t.length - 1;
    while (start < end) {
      let swapped = false;
      for (let i = start; i < end; i++) {
        if (t.cmp(i, i + 1) > 0) {
          t.swap(i, i + 1);
          swapped = true;
        }
      }
      end--;
      if (!swapped) break;

      swapped = false;
      for (let i = end - 1; i >= start; i--) {
        if (t.cmp(i, i + 1) > 0) {
          t.swap(i, i + 1);
          swapped = true;
        }
      }
      start++;
      if (!swapped) break;
    }
  },
};
