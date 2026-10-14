import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

/** 기적을 기다리는 횟수 */
export const MIRACLE_MAX_CHECKS = 10;

const CODE = defineCode(`function miracleSort(arr) {
  // 우주선이 메모리 비트를 뒤집어 배열을 정렬해 주기를 기다린다 (최대 10번 확인)
  for (let check = 0; check < 10; check++) {
    if (isSorted(arr)) return arr;
    // 기도한다 🙏
  }
  return arr; // 기적은 일어나지 않았다
}

function isSorted(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false; //@cmp
  }
  return true;
}`);

const L = { cmp: CODE.line("cmp") };

export const miracleSort: SortAlgorithm = {
  id: "miracle",
  name: "기적 정렬",
  category: "fun",
  desc: "배열이 저절로 정렬되기를 기다림",
  complexity: { best: "O(n)", average: "∞", worst: "∞", space: "O(1)" },
  stable: true,
  note: "배열을 전혀 바꾸지 않아요. 이미 정렬된 배열이 아니면 기적은 일어나지 않습니다.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    for (let check = 0; check < MIRACLE_MAX_CHECKS; check++) {
      let sorted = true;
      for (let i = 0; i < t.length - 1 && sorted; i++) {
        if (t.cmp(i, i + 1, L.cmp) > 0) sorted = false;
      }
      if (sorted) return;
    }
    return true;
  },
};
