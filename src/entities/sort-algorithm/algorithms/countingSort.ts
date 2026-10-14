import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function countingSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // 1) 최솟값·최댓값을 찾는다
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = arr[i]; //@read
    min = Math.min(min, x);
    max = Math.max(max, x);
  }
  // 2) 값마다 개수를 세고, 누적합으로 바꿔 각 값이 끝나는 위치를 구한다
  const count = new Array(max - min + 1).fill(0);
  for (const x of arr) count[x - min]++;
  for (let v = 1; v < count.length; v++) count[v] += count[v - 1];
  // 3) 뒤에서부터 자리를 정해 결과 순서를 만든다 (같은 값의 순서 유지 → 안정)
  const output = new Array(n);
  for (let i = n - 1; i >= 0; i--) output[--count[arr[i] - min]] = arr[i];
  // 4) 결과 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  for (let k = 0; k < n; k++) {
    const from = arr.indexOf(output[k], k);
    arr.splice(k, 0, ...arr.splice(from, 1)); //@move
  }
  return arr;
}`);

const L = { read: CODE.line("read"), move: CODE.line("move") };

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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      t.mark(i, L.read);
      min = Math.min(min, t.value(i));
      max = Math.max(max, t.value(i));
    }

    const count = new Array(max - min + 1).fill(0);
    for (let i = 0; i < n; i++) count[t.value(i) - min]++;
    for (let v = 1; v < count.length; v++) count[v] += count[v - 1];

    const output = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      output[--count[t.value(i) - min]] = t.item(i);
    }
    t.arrange(0, output, L.move);
  },
};
