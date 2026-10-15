import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function radixSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  const max = Math.max(...arr);
  // 1의 자리부터 자릿수마다 안정적으로 다시 배치한다 (LSD)
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const digit = (x) => Math.floor(x / exp) % 10;
    const count = new Array(10).fill(0);
    for (let i = 0; i < n; i++) {
      const d = digit(arr[i]); //@read
      count[d]++;
    }
    for (let d = 1; d < 10; d++) count[d] += count[d - 1];
    // 뒤에서부터 자리를 정해 같은 자릿수끼리의 순서를 유지
    const output = new Array(n);
    for (let i = n - 1; i >= 0; i--) output[--count[digit(arr[i])]] = arr[i];
    // 결과 순서대로 원소를 꺼내 제자리에 끼워 넣는다
    for (let k = 0; k < n; k++) {
      const from = arr.indexOf(output[k], k);
      arr.splice(k, 0, ...arr.splice(from, 1)); //@move
    }
  }
  return arr;
}`);

const L = { read: CODE.line("read"), move: CODE.line("move") };

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
  code: CODE.code,
  codeLabels: CODE.labels,
  structure: { kind: "radix" },
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    let max = 0;
    for (let i = 0; i < n; i++) max = Math.max(max, t.value(i));

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      const digit = (i: number) => Math.floor(t.value(i) / exp) % 10;
      const count = new Array(10).fill(0);
      for (let i = 0; i < n; i++) {
        t.mark(i, L.read);
        count[digit(i)]++;
      }
      for (let d = 1; d < 10; d++) count[d] += count[d - 1];

      const output = new Array(n);
      for (let i = n - 1; i >= 0; i--) output[--count[digit(i)]] = t.item(i);
      t.arrange(0, output, L.move);
    }
  },
};
