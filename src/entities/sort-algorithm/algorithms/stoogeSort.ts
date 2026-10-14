import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function stoogeSort(arr, i = 0, j = arr.length - 1) {
  if (j <= i) return arr;
  // 양 끝이 뒤집혀 있으면 교환
  if (arr[i] > arr[j]) { //@cmp
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
  }
  if (j - i + 1 > 2) {
    const third = Math.floor((j - i + 1) / 3);
    stoogeSort(arr, i, j - third); // 앞 2/3 정렬
    stoogeSort(arr, i + third, j); // 뒤 2/3 정렬
    stoogeSort(arr, i, j - third); // 앞 2/3 다시 정렬
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

function stooge(t: Tracer, i: number, j: number) {
  if (t.cmp(i, j, L.cmp) > 0) t.swap(i, j, L.swap);
  const len = j - i + 1;
  if (len <= 2) return;
  const third = Math.floor(len / 3);
  stooge(t, i, j - third);
  stooge(t, i + third, j);
  stooge(t, i, j - third);
}

export const stoogeSort: SortAlgorithm = {
  id: "stooge",
  name: "스투지 정렬",
  category: "fun",
  desc: "앞 2/3, 뒤 2/3, 다시 앞 2/3을 정렬",
  complexity: {
    best: "O(n^2.71)",
    average: "O(n^2.71)",
    worst: "O(n^2.71)",
    space: "O(log n)",
  },
  stable: false,
  note: "버블 정렬보다도 느려요. 약 300개를 넘으면 연산 한도(300만)에 걸려 미완료로 끝납니다.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    if (t.length >= 2) stooge(t, 0, t.length - 1);
  },
};
