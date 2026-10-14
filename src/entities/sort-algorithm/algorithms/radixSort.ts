import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const radixSort: SortAlgorithm = {
  id: "radix",
  name: "기수 정렬",
  category: "linear",
  desc: "자릿수 별로 정렬",
  complexity: {
    best: "O(d·n)",
    average: "O(d·n)",
    worst: "O(d·n)",
    space: "O(n + 10)",
  },
  stable: true,
  code: ALGO_CODE.radix,
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    let max = 0;
    for (let i = 0; i < n; i++) max = Math.max(max, t.value(i));

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      const digit = (i: number) => Math.floor(t.value(i) / exp) % 10;
      const count = new Array(10).fill(0);
      for (let i = 0; i < n; i++) {
        t.mark(i);
        count[digit(i)]++;
      }
      for (let d = 1; d < 10; d++) count[d] += count[d - 1];

      const output = new Array(n);
      for (let i = n - 1; i >= 0; i--) output[--count[digit(i)]] = t.item(i);
      t.arrange(0, output);
    }
  },
};
