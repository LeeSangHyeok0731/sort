import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import { mergeRuns } from "./mergeSort";

const CODE = defineCode(`function strandSort(arr) {
  const n = arr.length;
  // [0, sorted)는 정렬 완료, 그 뒤가 남은 원소
  let sorted = 0;
  while (sorted < n) {
    // 남은 원소의 첫 원소부터 가닥(strand)을 시작해,
    // 가닥의 끝 이상인 원소를 차례로 가닥 바로 뒤로 끌어온다
    let strandEnd = sorted + 1; // 가닥: [sorted, strandEnd)
    for (let i = strandEnd; i < n; i++) {
      if (arr[i] >= arr[strandEnd - 1]) { //@cmp-strand
        arr.splice(strandEnd, 0, ...arr.splice(i, 1)); //@move-strand
        strandEnd++;
      }
    }
    // 정렬된 앞부분과 가닥을 병합
    if (sorted > 0) merge(arr, 0, sorted - 1, strandEnd - 1);
    sorted = strandEnd;
  }
  return arr;
}

// 보조 배열 없이 병합: 오른쪽 원소가 더 작으면 꺼내서 왼쪽 원소 앞에 끼워 넣는다
function merge(arr, left, mid, right) {
  let i = left, j = mid + 1;
  while (i < j && j <= right) {
    if (arr[j] < arr[i]) { //@cmp-merge
      arr.splice(i, 0, ...arr.splice(j, 1)); //@move-merge
      j++;
    }
    i++;
  }
}`);

const L = {
  cmpStrand: CODE.line("cmp-strand"),
  moveStrand: CODE.line("move-strand"),
  merge: { cmp: CODE.line("cmp-merge"), move: CODE.line("move-merge") },
};

export const strandSort: SortAlgorithm = {
  id: "strand",
  name: "스트랜드 정렬",
  category: "special",
  desc: "증가하는 가닥을 뽑아 정렬된 앞부분에 병합",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(n)" },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    let sorted = 0;
    while (sorted < n) {
      let strandEnd = sorted + 1;
      for (let i = strandEnd; i < n; i++) {
        if (t.cmp(i, strandEnd - 1, L.cmpStrand) >= 0) {
          t.move(i, strandEnd, L.moveStrand);
          strandEnd++;
        }
      }
      if (sorted > 0) mergeRuns(t, 0, sorted - 1, strandEnd - 1, L.merge);
      sorted = strandEnd;
    }
  },
};
