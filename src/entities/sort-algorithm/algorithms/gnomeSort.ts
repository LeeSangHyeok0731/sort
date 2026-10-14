import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const gnomeSort: SortAlgorithm = {
  id: "gnome",
  name: "그놈 정렬",
  category: "special",
  desc: "잘못된 위치면 뒤로 가며 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: ALGO_CODE.gnome,
  sort(t) {
    let i = 1;
    while (i < t.length) {
      if (i === 0 || t.cmp(i - 1, i) <= 0) {
        i++;
      } else {
        t.swap(i - 1, i);
        i--;
      }
    }
  },
};
