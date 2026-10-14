import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const countingSort: SortAlgorithm = {
  id: "counting",
  name: "계수 정렬",
  category: "linear",
  desc: "값의 개수를 세서 정렬",
  complexity: {
    best: "O(n + k)",
    average: "O(n + k)",
    worst: "O(n + k)",
    space: "O(n + k)",
  },
  stable: true,
  code: ALGO_CODE.counting,
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      t.mark(i);
      min = Math.min(min, t.value(i));
      max = Math.max(max, t.value(i));
    }

    const count = new Array(max - min + 1).fill(0);
    for (let i = 0; i < n; i++) count[t.value(i) - min]++;
    for (let v = 1; v < count.length; v++) count[v] += count[v - 1];

    // 뒤에서부터 누적 개수로 자리를 정해 안정성을 보장한다
    const output = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      output[--count[t.value(i) - min]] = t.item(i);
    }
    t.arrange(0, output);
  },
};
