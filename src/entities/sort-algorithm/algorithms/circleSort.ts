import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`function circleSort(arr) {
  // 한 바퀴 돌았는데 교환이 없을 때까지 반복
  while (circle(arr, 0, arr.length - 1));
  return arr;
}

function circle(arr, lo, hi) {
  if (lo >= hi) return false;
  let swapped = false;
  let l = lo, h = hi;
  // 양 끝에서 안쪽으로 좁혀 가며 비교
  while (l < h) {
    if (arr[l] > arr[h]) { //@cmp-ends
      [arr[l], arr[h]] = [arr[h], arr[l]]; //@swap-ends
      swapped = true;
    }
    l++;
    h--;
  }
  // 길이가 홀수면 가운데와 그 오른쪽을 비교
  if (l === h && arr[l] > arr[h + 1]) { //@cmp-middle
    [arr[l], arr[h + 1]] = [arr[h + 1], arr[l]]; //@swap-middle
    swapped = true;
  }
  const mid = Math.floor((lo + hi) / 2);
  const left = circle(arr, lo, mid);
  const right = circle(arr, mid + 1, hi);
  return swapped || left || right;
}`);

const L = {
  cmpEnds: CODE.line("cmp-ends"),
  swapEnds: CODE.line("swap-ends"),
  cmpMiddle: CODE.line("cmp-middle"),
  swapMiddle: CODE.line("swap-middle"),
};

/** 구간의 양 끝을 안쪽으로 좁혀 가며 비교한 뒤 두 절반에 재귀. 교환이 있었는지 반환한다. */
function circle(t: Tracer, lo: number, hi: number): boolean {
  if (lo >= hi) return false;
  let swapped = false;
  let l = lo;
  let h = hi;
  while (l < h) {
    if (t.cmp(l, h, L.cmpEnds) > 0) {
      t.swap(l, h, L.swapEnds);
      swapped = true;
    }
    l++;
    h--;
  }
  if (l === h && t.cmp(l, h + 1, L.cmpMiddle) > 0) {
    t.swap(l, h + 1, L.swapMiddle);
    swapped = true;
  }
  const mid = Math.floor((lo + hi) / 2);
  const left = circle(t, lo, mid);
  const right = circle(t, mid + 1, hi);
  return swapped || left || right;
}

export const circleSort: SortAlgorithm = {
  id: "circle",
  name: "서클 정렬",
  category: "special",
  desc: "양 끝에서 안쪽으로 원을 그리며 비교",
  complexity: {
    best: "O(n log n)",
    average: "O(n log² n)",
    worst: "O(n log² n)",
    space: "O(log n)",
  },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    while (circle(t, 0, t.length - 1));
  },
};
