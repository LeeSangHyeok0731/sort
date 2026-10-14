import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** [0, end] 구간을 뒤집는다. */
function flip(t: Tracer, end: number) {
  for (let i = 0, j = end; i < j; i++, j--) t.swap(i, j);
}

export const pancakeSort: SortAlgorithm = {
  id: "pancake",
  name: "팬케이크 정렬",
  category: "special",
  desc: "뒤집기를 이용한 정렬",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: ALGO_CODE.pancake,
  sort(t) {
    for (let size = t.length; size > 1; size--) {
      let maxIdx = 0;
      for (let i = 1; i < size; i++) {
        if (t.cmp(i, maxIdx) > 0) maxIdx = i;
      }
      if (maxIdx === size - 1) continue;
      if (maxIdx > 0) flip(t, maxIdx);
      flip(t, size - 1);
    }
  },
};
