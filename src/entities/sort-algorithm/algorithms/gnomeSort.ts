import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function gnomeSort(arr) {
  let i = 1;
  while (i < arr.length) {
    if (i === 0 || arr[i - 1] <= arr[i]) { //@cmp
      i++; // 순서가 맞으면 한 칸 앞으로
    } else {
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; //@swap
      i--; // 틀리면 바꾸고 한 칸 뒤로 (제자리를 찾아 내려간다)
    }
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const gnomeSort: SortAlgorithm = {
  id: "gnome",
  name: "그놈 정렬",
  category: "special",
  desc: "잘못된 위치면 뒤로 가며 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    let i = 1;
    while (i < t.length) {
      if (i === 0 || t.cmp(i - 1, i, L.cmp) <= 0) {
        i++;
      } else {
        t.swap(i - 1, i, L.swap);
        i--;
      }
    }
  },
};
