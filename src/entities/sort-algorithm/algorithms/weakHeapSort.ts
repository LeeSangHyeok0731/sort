import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function weakHeapSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // r[i]: i의 두 자식을 뒤집었는지 (i의 "왼쪽" 자식 = 2i + r[i])
  const r = new Uint8Array(n);

  // j의 구별된 조상: j가 오른쪽 자식이 될 때까지 올라간 뒤의 부모
  const ancestor = (j) => {
    while ((j & 1) === r[j >> 1]) j >>= 1;
    return j >> 1;
  };
  // 조상 i가 j보다 작으면 교환하고, j의 두 자식을 뒤집는다
  const join = (i, j) => {
    if (arr[i] < arr[j]) { //@cmp-join
      [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap-join
      r[j] ^= 1;
    }
  };

  for (let j = n - 1; j >= 1; j--) join(ancestor(j), j);

  for (let end = n - 1; end >= 2; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]]; //@swap-root
    // 1번 노드에서 왼쪽 자식만 따라 내려간 뒤, 올라오며 루트와 합친다
    let x = 1, y;
    while ((y = 2 * x + r[x]) < end) x = y;
    for (; x > 0; x >>= 1) join(0, x);
  }
  [arr[0], arr[1]] = [arr[1], arr[0]]; //@swap-last
  return arr;
}`);

const L = {
  cmpJoin: CODE.line("cmp-join"),
  swapJoin: CODE.line("swap-join"),
  swapRoot: CODE.line("swap-root"),
  swapLast: CODE.line("swap-last"),
};

export const weakHeapSort: SortAlgorithm = {
  id: "weakHeap",
  name: "약한 힙 정렬",
  category: "standard",
  desc: "조건을 느슨하게 한 힙으로 비교 횟수를 줄임",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n) 비트",
  },
  stable: false,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    const r = new Uint8Array(n);

    const distinguishedAncestor = (j: number) => {
      while ((j & 1) === r[j >> 1]) j >>= 1;
      return j >> 1;
    };
    const join = (i: number, j: number) => {
      if (t.cmp(i, j, L.cmpJoin) < 0) {
        t.swap(i, j, L.swapJoin);
        r[j] ^= 1;
      }
    };

    for (let j = n - 1; j >= 1; j--) join(distinguishedAncestor(j), j);

    for (let end = n - 1; end >= 2; end--) {
      t.swap(0, end, L.swapRoot);
      let x = 1;
      for (let y; (y = 2 * x + r[x]) < end; ) x = y;
      for (; x > 0; x >>= 1) join(0, x);
    }
    t.swap(0, 1, L.swapLast);
  },
};
