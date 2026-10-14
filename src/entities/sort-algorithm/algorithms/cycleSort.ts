import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const cycleSort: SortAlgorithm = {
  id: "cycle",
  name: "사이클 정렬",
  category: "standard",
  desc: "원소를 제자리로 바로 보내 쓰기를 최소화",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: ALGO_CODE.cycle,
  sort(t) {
    const n = t.length;
    // cs 위치의 원소를 최종 자리로 보내고, 밀려난 원소로 같은 일을 반복 (사이클)
    for (let cs = 0; cs < n - 1; cs++) {
      for (;;) {
        // 자신보다 작은 원소 수 = 최종 위치
        let pos = cs;
        for (let i = cs + 1; i < n; i++) {
          if (t.cmp(i, cs) < 0) pos++;
        }
        if (pos === cs) break;
        // 같은 값이 이미 그 자리에 있으면 그 뒤로
        while (t.cmp(pos, cs) === 0) pos++;
        t.swap(cs, pos); // 교환 한 번마다 원소 하나가 최종 위치에 놓인다
      }
    }
  },
};
