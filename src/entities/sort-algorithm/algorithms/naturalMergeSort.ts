import type { SortAlgorithm } from "../model/types";
import { mergeRuns } from "./mergeSort";
import { ALGO_CODE } from "./code";

export const naturalMergeSort: SortAlgorithm = {
  id: "naturalMerge",
  name: "자연 병합 정렬",
  category: "standard",
  desc: "이미 정렬된 구간(런)을 찾아 이웃끼리 병합",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
  },
  stable: true,
  code: ALGO_CODE.naturalMerge,
  sort(t) {
    const n = t.length;
    for (;;) {
      // 오름차순 런의 경계를 찾는다
      const runs: Array<[number, number]> = [];
      let start = 0;
      for (let i = 1; i <= n; i++) {
        if (i === n || t.cmp(i - 1, i) > 0) {
          runs.push([start, i - 1]);
          start = i;
        }
      }
      if (runs.length <= 1) return;
      // 이웃한 두 런씩 병합 (구간이 겹치지 않으므로 서로 영향이 없다)
      for (let k = 0; k + 1 < runs.length; k += 2) {
        mergeRuns(t, runs[k][0], runs[k][1], runs[k + 1][1]);
      }
    }
  },
};
