import type { SortAlgorithm } from "../model/types";
import { mergeRuns } from "./mergeSort";
import { ALGO_CODE } from "./code";

export const strandSort: SortAlgorithm = {
  id: "strand",
  name: "스트랜드 정렬",
  category: "special",
  desc: "증가하는 가닥을 뽑아 정렬된 앞부분에 병합",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(n)" },
  stable: true,
  code: ALGO_CODE.strand,
  sort(t) {
    const n = t.length;
    // [0, sorted)는 정렬 완료, 그 뒤가 남은 원소
    let sorted = 0;
    while (sorted < n) {
      // 남은 원소의 첫 원소부터 시작해, 가닥의 끝 이상인 원소를 차례로 가닥 뒤에 붙인다
      let strandEnd = sorted + 1; // 가닥: [sorted, strandEnd)
      for (let i = strandEnd; i < n; i++) {
        if (t.cmp(i, strandEnd - 1) >= 0) {
          t.move(i, strandEnd);
          strandEnd++;
        }
      }
      if (sorted > 0) mergeRuns(t, 0, sorted - 1, strandEnd - 1);
      sorted = strandEnd;
    }
  },
};
