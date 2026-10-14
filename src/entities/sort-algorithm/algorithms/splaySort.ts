import type { ArrayItem } from "@/shared/model";
import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

const NIL = -1;

export const splaySort: SortAlgorithm = {
  id: "splay",
  name: "스플레이 정렬",
  category: "special",
  desc: "넣을 때마다 그 노드를 루트로 끌어올리는 트리 정렬",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n) (분할 상환)",
    space: "O(n)",
  },
  stable: true,
  code: ALGO_CODE.splay,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    // 노드 = 배열 인덱스. 트리를 만드는 동안 배열은 움직이지 않는다.
    const left = new Array<number>(n).fill(NIL);
    const right = new Array<number>(n).fill(NIL);
    const parent = new Array<number>(n).fill(NIL);
    let root = 0;

    /** x를 부모 자리로 한 단계 회전 (중위 순서는 그대로) */
    const rotateUp = (x: number) => {
      const p = parent[x];
      const g = parent[p];
      if (left[p] === x) {
        left[p] = right[x];
        if (right[x] !== NIL) parent[right[x]] = p;
        right[x] = p;
      } else {
        right[p] = left[x];
        if (left[x] !== NIL) parent[left[x]] = p;
        left[x] = p;
      }
      parent[p] = x;
      parent[x] = g;
      if (g === NIL) root = x;
      else if (left[g] === p) left[g] = x;
      else right[g] = x;
    };

    /** x를 루트까지 끌어올린다 (zig / zig-zig / zig-zag) */
    const splay = (x: number) => {
      while (parent[x] !== NIL) {
        const p = parent[x];
        const g = parent[p];
        if (g === NIL) rotateUp(x);
        else if ((left[g] === p) === (left[p] === x)) {
          rotateUp(p);
          rotateUp(x);
        } else {
          rotateUp(x);
          rotateUp(x);
        }
      }
    };

    for (let i = 1; i < n; i++) {
      let node = root;
      for (;;) {
        // 같은 값은 오른쪽 → 중위 순회에서 입력 순서 유지 (안정)
        if (t.cmp(i, node) < 0) {
          if (left[node] === NIL) {
            left[node] = i;
            break;
          }
          node = left[node];
        } else {
          if (right[node] === NIL) {
            right[node] = i;
            break;
          }
          node = right[node];
        }
      }
      parent[i] = node;
      splay(i);
    }

    const order: ArrayItem[] = [];
    const stack: number[] = [];
    for (let cur = root; cur !== NIL || stack.length > 0; ) {
      while (cur !== NIL) {
        stack.push(cur);
        cur = left[cur];
      }
      const x = stack.pop()!;
      order.push(t.item(x));
      cur = right[x];
    }
    t.arrange(0, order);
  },
};
