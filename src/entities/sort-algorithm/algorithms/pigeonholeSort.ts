import type { ArrayItem } from "@/shared/model";
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function pigeonholeSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  const min = Math.min(...arr), max = Math.max(...arr);
  // 값마다 칸(비둘기집)을 하나씩 만든다.
  // 계수 정렬이 "개수"를 세는 것과 달리, 칸에 원소 자체를 담는다
  const holes = Array.from({ length: max - min + 1 }, () => []);
  for (let i = 0; i < n; i++) {
    const x = arr[i]; //@read
    holes[x - min].push(x);
  }
  // 칸 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  const order = holes.flat();
  for (let k = 0; k < n; k++) {
    const from = arr.indexOf(order[k], k);
    arr.splice(k, 0, ...arr.splice(from, 1)); //@move
  }
  return arr;
}`);

const L = { read: CODE.line("read"), move: CODE.line("move") };

export const pigeonholeSort: SortAlgorithm = {
  id: "pigeonhole",
  name: "비둘기집 정렬",
  category: "linear",
  desc: "값마다 칸을 하나씩 두고 원소를 직접 넣음",
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
      min = Math.min(min, t.value(i));
      max = Math.max(max, t.value(i));
    }
    const holes: ArrayItem[][] = Array.from({ length: max - min + 1 }, () => []);
    for (let i = 0; i < n; i++) {
      t.mark(i, L.read);
      holes[t.value(i) - min].push(t.item(i));
    }
    t.arrange(0, holes.flat(), L.move);
  },
};
