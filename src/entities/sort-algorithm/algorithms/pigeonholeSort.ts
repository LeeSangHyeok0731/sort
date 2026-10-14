import type { ArrayItem } from "@/shared/model";
import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const pigeonholeSort: SortAlgorithm = {
  id: "pigeonhole",
  name: "비둘기집 정렬",
  category: "linear",
  desc: "값마다 칸을 하나씩 두고 원소를 직접 넣음",
  complexity: {
    best: "O(n + k)",
    average: "O(n + k)",
    worst: "O(n + k)",
    space: "O(n + k)",
  },
  stable: true,
  code: ALGO_CODE.pigeonhole,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      min = Math.min(min, t.value(i));
      max = Math.max(max, t.value(i));
    }
    // 계수 정렬이 "개수"를 세는 것과 달리, 칸에 원소 자체를 담는다
    const holes: ArrayItem[][] = Array.from({ length: max - min + 1 }, () => []);
    for (let i = 0; i < n; i++) {
      t.mark(i);
      holes[t.value(i) - min].push(t.item(i));
    }
    t.arrange(0, holes.flat());
  },
};
