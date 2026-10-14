import type { ArrayItem } from "@/shared/model";
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

type Node = { index: number; left: Node | null; right: Node | null };

const CODE = defineCode(`function treeSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // 1) 이진 검색 트리에 넣는다 (노드 = 배열 인덱스, 이 동안 배열은 그대로)
  const root = { index: 0, left: null, right: null };
  for (let i = 1; i < n; i++) {
    let node = root;
    for (;;) {
      // 같은 값은 오른쪽 → 입력 순서 유지 (안정)
      const side = arr[i] < arr[node.index] ? "left" : "right"; //@cmp
      if (!node[side]) {
        node[side] = { index: i, left: null, right: null };
        break;
      }
      node = node[side];
    }
  }
  // 2) 중위 순회 순서 = 정렬된 순서 (정렬된 입력이면 깊이가 n이라 재귀 대신 스택)
  const order = [];
  const stack = [];
  let cur = root;
  while (cur || stack.length > 0) {
    while (cur) {
      stack.push(cur);
      cur = cur.left;
    }
    const node = stack.pop();
    order.push(arr[node.index]);
    cur = node.right;
  }
  // 3) 그 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  for (let k = 0; k < n; k++) {
    const from = arr.indexOf(order[k], k);
    arr.splice(k, 0, ...arr.splice(from, 1)); //@move
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), move: CODE.line("move") };

export const treeSort: SortAlgorithm = {
  id: "tree",
  name: "트리 정렬",
  category: "special",
  desc: "이진 검색 트리를 이용한 정렬",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(n)",
  },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    const root: Node = { index: 0, left: null, right: null };
    for (let i = 1; i < n; i++) {
      let node = root;
      while (true) {
        const side = t.cmp(i, node.index, L.cmp) < 0 ? "left" : "right";
        const child = node[side];
        if (!child) {
          node[side] = { index: i, left: null, right: null };
          break;
        }
        node = child;
      }
    }

    const order: ArrayItem[] = [];
    const stack: Node[] = [];
    let cur: Node | null = root;
    while (cur || stack.length > 0) {
      while (cur) {
        stack.push(cur);
        cur = cur.left;
      }
      const node: Node = stack.pop()!;
      order.push(t.item(node.index));
      cur = node.right;
    }
    t.arrange(0, order, L.move);
  },
};
