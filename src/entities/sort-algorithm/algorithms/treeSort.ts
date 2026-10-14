import type { ArrayItem } from "@/shared/model";
import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

type Node = { index: number; left: Node | null; right: Node | null };

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
  code: ALGO_CODE.tree,
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    // 트리를 만드는 동안 배열은 움직이지 않으므로 인덱스로 노드를 가리킬 수 있다
    const root: Node = { index: 0, left: null, right: null };
    for (let i = 1; i < n; i++) {
      let node = root;
      while (true) {
        // 같은 값은 오른쪽으로 보내 입력 순서를 유지한다 (안정 정렬)
        const side = t.cmp(i, node.index) < 0 ? "left" : "right";
        const child = node[side];
        if (!child) {
          node[side] = { index: i, left: null, right: null };
          break;
        }
        node = child;
      }
    }

    // 중위 순회 (정렬된 입력이면 트리 깊이가 n이 되므로 재귀 대신 스택 사용)
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
    t.arrange(0, order);
  },
};
