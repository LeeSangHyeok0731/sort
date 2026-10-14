import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function cocktailSort(arr) {
  let start = 0, end = arr.length - 1;
  while (start < end) {
    let swapped = false;
    // → 방향: 큰 값을 끝으로 보낸다
    for (let i = start; i < end; i++) {
      if (arr[i] > arr[i + 1]) { //@cmp-forward
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; //@swap-forward
        swapped = true;
      }
    }
    end--;
    if (!swapped) break;

    swapped = false;
    // ← 방향: 작은 값을 앞으로 보낸다
    for (let i = end - 1; i >= start; i--) {
      if (arr[i] > arr[i + 1]) { //@cmp-backward
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; //@swap-backward
        swapped = true;
      }
    }
    start++;
    if (!swapped) break;
  }
  return arr;
}`);

const L = {
  cmpForward: CODE.line("cmp-forward"),
  swapForward: CODE.line("swap-forward"),
  cmpBackward: CODE.line("cmp-backward"),
  swapBackward: CODE.line("swap-backward"),
};

export const cocktailSort: SortAlgorithm = {
  id: "cocktail",
  name: "칵테일 정렬",
  category: "special",
  desc: "양방향 버블 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    let start = 0;
    let end = t.length - 1;
    while (start < end) {
      let swapped = false;
      for (let i = start; i < end; i++) {
        if (t.cmp(i, i + 1, L.cmpForward) > 0) {
          t.swap(i, i + 1, L.swapForward);
          swapped = true;
        }
      }
      end--;
      if (!swapped) break;

      swapped = false;
      for (let i = end - 1; i >= start; i--) {
        if (t.cmp(i, i + 1, L.cmpBackward) > 0) {
          t.swap(i, i + 1, L.swapBackward);
          swapped = true;
        }
      }
      start++;
      if (!swapped) break;
    }
  },
};
