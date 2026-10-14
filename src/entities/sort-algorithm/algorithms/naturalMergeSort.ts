import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import { mergeRuns } from "./mergeSort";

const CODE = defineCode(`function naturalMergeSort(arr) {
  const n = arr.length;
  for (;;) {
    // 이미 오름차순인 구간(런)의 경계를 찾는다
    const runs = [];
    let start = 0;
    for (let i = 1; i <= n; i++) {
      if (i === n || arr[i - 1] > arr[i]) { //@cmp-run
        runs.push([start, i - 1]);
        start = i;
      }
    }
    if (runs.length <= 1) return arr; // 런이 하나면 정렬 완료
    // 이웃한 런끼리 병합 (구간이 겹치지 않아 서로 영향 없음)
    for (let k = 0; k + 1 < runs.length; k += 2) {
      merge(arr, runs[k][0], runs[k][1], runs[k + 1][1]);
    }
  }
}

// 보조 배열 없이 병합: 오른쪽 원소가 더 작으면 꺼내서 왼쪽 원소 앞에 끼워 넣는다
function merge(arr, left, mid, right) {
  let i = left, j = mid + 1;
  while (i < j && j <= right) {
    if (arr[j] < arr[i]) { //@cmp
      arr.splice(i, 0, ...arr.splice(j, 1)); //@move
      j++;
    }
    i++;
  }
}`);

const L = { cmpRun: CODE.line("cmp-run"), cmp: CODE.line("cmp"), move: CODE.line("move") };

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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (;;) {
      const runs: Array<[number, number]> = [];
      let start = 0;
      for (let i = 1; i <= n; i++) {
        if (i === n || t.cmp(i - 1, i, L.cmpRun) > 0) {
          runs.push([start, i - 1]);
          start = i;
        }
      }
      if (runs.length <= 1) return;
      for (let k = 0; k + 1 < runs.length; k += 2) {
        mergeRuns(t, runs[k][0], runs[k][1], runs[k + 1][1], L);
      }
    }
  },
};
