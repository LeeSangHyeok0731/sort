import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

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
  code: ALGO_CODE.weakHeap,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    // r[i]: i의 두 자식을 뒤집었는지 (왼쪽 자식 = 2i + r[i])
    const r = new Uint8Array(n);

    /** j의 구별된 조상: j가 오른쪽 자식이 될 때까지 올라간 뒤의 부모 */
    const distinguishedAncestor = (j: number) => {
      while ((j & 1) === r[j >> 1]) j >>= 1;
      return j >> 1;
    };

    /** i가 j의 구별된 조상일 때, 더 큰 값을 i로 올린다 */
    const join = (i: number, j: number) => {
      if (t.cmp(i, j) < 0) {
        t.swap(i, j);
        r[j] ^= 1;
      }
    };

    for (let j = n - 1; j >= 1; j--) join(distinguishedAncestor(j), j);

    for (let end = n - 1; end >= 2; end--) {
      t.swap(0, end);
      // 1번 노드에서 왼쪽 자식만 따라 가장 아래까지 내려간 뒤, 올라오며 루트와 합친다
      let x = 1;
      for (let y; (y = 2 * x + r[x]) < end; ) x = y;
      for (; x > 0; x >>= 1) join(0, x);
    }
    t.swap(0, 1);
  },
};
