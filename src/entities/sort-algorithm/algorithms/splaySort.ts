import type { ArrayItem } from "@/shared/model";
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const NIL = -1;

const CODE = defineCode(`function splaySort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // 노드 = 배열 인덱스. 트리를 만드는 동안 배열은 그대로
  const left = new Array(n).fill(-1), right = new Array(n).fill(-1), parent = new Array(n).fill(-1);
  let root = 0;

  // x를 부모 자리로 한 단계 회전 (중위 순서는 그대로)
  const rotateUp = (x) => {
    const p = parent[x], g = parent[p];
    if (left[p] === x) {
      left[p] = right[x];
      if (right[x] !== -1) parent[right[x]] = p;
      right[x] = p;
    } else {
      right[p] = left[x];
      if (left[x] !== -1) parent[left[x]] = p;
      left[x] = p;
    }
    parent[p] = x;
    parent[x] = g;
    if (g === -1) root = x;
    else if (left[g] === p) left[g] = x;
    else right[g] = x;
  };
  // x를 루트까지 끌어올린다 (zig / zig-zig / zig-zag)
  const splay = (x) => {
    while (parent[x] !== -1) {
      const p = parent[x], g = parent[p];
      if (g === -1) rotateUp(x);
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
    // 1) 이진 검색 트리처럼 넣는다 (같은 값은 오른쪽 → 안정)
    let node = root;
    for (;;) {
      if (arr[i] < arr[node]) { //@cmp
        if (left[node] === -1) {
          left[node] = i;
          break;
        }
        node = left[node];
      } else {
        if (right[node] === -1) {
          right[node] = i;
          break;
        }
        node = right[node];
      }
    }
    parent[i] = node;
    // 2) 방금 넣은 노드를 루트로 → 최근 값 근처는 탐색이 짧아진다
    splay(i);
  }

  // 3) 중위 순회 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  const order = [], stack = [];
  for (let cur = root; cur !== -1 || stack.length > 0; ) {
    while (cur !== -1) {
      stack.push(cur);
      cur = left[cur];
    }
    const x = stack.pop();
    order.push(arr[x]);
    cur = right[x];
  }
  for (let k = 0; k < n; k++) {
    const from = arr.indexOf(order[k], k);
    arr.splice(k, 0, ...arr.splice(from, 1)); //@move
  }
  return arr;
}`);

const L = { cmp: CODE.line("cmp"), move: CODE.line("move") };

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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    const left = new Array<number>(n).fill(NIL);
    const right = new Array<number>(n).fill(NIL);
    const parent = new Array<number>(n).fill(NIL);
    let root = 0;

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
        if (t.cmp(i, node, L.cmp) < 0) {
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
    t.arrange(0, order, L.move);
  },
};
