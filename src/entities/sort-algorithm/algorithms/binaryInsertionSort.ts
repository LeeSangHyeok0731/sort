import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function binaryInsertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    // [0, i)에서 arr[i]보다 큰 첫 위치를 이진 탐색으로 찾는다
    // (같은 값 뒤에 넣어 안정 정렬 유지)
    let lo = 0, hi = i;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (arr[mid] > arr[i]) hi = mid; //@cmp
      else lo = mid + 1;
    }
    // arr[i]를 꺼내 lo 자리에 끼워 넣는다 (사이 원소들은 한 칸씩 밀림)
    arr.splice(lo, 0, ...arr.splice(i, 1)); //@move
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), move: CODE.line("move") };

export const binaryInsertionSort: SortAlgorithm = {
  id: "binaryInsertion",
  name: "이진 삽입 정렬",
  category: "standard",
  desc: "삽입 위치를 이진 탐색으로 찾는 삽입 정렬",
  complexity: {
    best: "O(n log n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
  },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    for (let i = 1; i < t.length; i++) {
      let lo = 0;
      let hi = i;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (t.cmp(mid, i, L.cmp) > 0) hi = mid;
        else lo = mid + 1;
      }
      t.move(i, lo, L.move);
    }
  },
};
