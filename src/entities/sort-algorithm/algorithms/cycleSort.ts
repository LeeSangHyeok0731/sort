import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function cycleSort(arr) {
  const n = arr.length;
  for (let cs = 0; cs < n - 1; cs++) {
    for (;;) {
      // cs 자리 원소보다 작은 원소 수 = 그 원소의 최종 위치
      let pos = cs;
      for (let i = cs + 1; i < n; i++) {
        if (arr[i] < arr[cs]) pos++; //@cmp-count
      }
      if (pos === cs) break; // 제자리면 다음 위치로
      // 같은 값이 이미 그 자리에 있으면 그 뒤로
      while (arr[pos] === arr[cs]) pos++; //@cmp-dup
      // 최종 위치로 보낸다. 밀려난 원소로 같은 일을 반복 (사이클)
      [arr[cs], arr[pos]] = [arr[pos], arr[cs]]; //@swap
    }
  }
  return arr;
}`);

const L = { cmpCount: CODE.line("cmp-count"), cmpDup: CODE.line("cmp-dup"), swap: CODE.line("swap") };

export const cycleSort: SortAlgorithm = {
  id: "cycle",
  name: "사이클 정렬",
  category: "standard",
  desc: "원소를 제자리로 바로 보내 쓰기를 최소화",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let cs = 0; cs < n - 1; cs++) {
      for (;;) {
        let pos = cs;
        for (let i = cs + 1; i < n; i++) {
          if (t.cmp(i, cs, L.cmpCount) < 0) pos++;
        }
        if (pos === cs) break;
        while (t.cmp(pos, cs, L.cmpDup) === 0) pos++;
        t.swap(cs, pos, L.swap); // 교환 한 번마다 원소 하나가 최종 위치에 놓인다
      }
    }
  },
};
