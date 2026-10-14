import type { ArrayItem } from "@/shared/model";
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const NIL = -1;

const CODE = defineCode(`function cartesianTreeSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  const left = new Array(n).fill(-1), right = new Array(n).fill(-1);

  // 1) 카테시안 트리: 값으로는 최소 힙, 중위 순회는 원래 순서.
  //    오른쪽 경로를 스택으로 유지하면 O(n)에 만들 수 있다 (같은 값은 먼저 나온 쪽이 조상 → 안정)
  const stack = [];
  for (let i = 0; i < n; i++) {
    let last = -1;
    while (stack.length > 0 && arr[stack[stack.length - 1]] > arr[i]) last = stack.pop(); //@cmp-build
    left[i] = last;
    if (stack.length > 0) right[stack[stack.length - 1]] = i;
    stack.push(i);
  }

  // 2) 우선순위 큐(최소 힙)에 루트를 넣고, 꺼낼 때마다 두 자식을 넣는다.
  //    이미 정렬된 구간은 트리가 한 줄이라 큐가 작다 → 거의 정렬된 입력에 빠름
  const less = (a, b) => {
    const c = arr[a] - arr[b]; //@cmp-heap
    return c < 0 || (c === 0 && a < b);
  };
  const heap = [];
  const push = (x) => {
    heap.push(x);
    for (let k = heap.length - 1; k > 0; ) {
      const p = (k - 1) >> 1;
      if (!less(heap[k], heap[p])) break;
      [heap[k], heap[p]] = [heap[p], heap[k]];
      k = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      for (let k = 0; ; ) {
        const l = 2 * k + 1, r = l + 1;
        let m = k;
        if (l < heap.length && less(heap[l], heap[m])) m = l;
        if (r < heap.length && less(heap[r], heap[m])) m = r;
        if (m === k) break;
        [heap[k], heap[m]] = [heap[m], heap[k]];
        k = m;
      }
    }
    return top;
  };

  const order = [];
  push(stack[0]);
  while (heap.length > 0) {
    const x = pop();
    order.push(arr[x]);
    if (left[x] !== -1) push(left[x]);
    if (right[x] !== -1) push(right[x]);
  }
  // 3) 꺼낸 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  for (let k = 0; k < n; k++) {
    const from = arr.indexOf(order[k], k);
    arr.splice(k, 0, ...arr.splice(from, 1)); //@move
  }
  return arr;
}`);

const L = { cmpBuild: CODE.line("cmp-build"), cmpHeap: CODE.line("cmp-heap"), move: CODE.line("move") };

export const cartesianTreeSort: SortAlgorithm = {
  id: "cartesian",
  name: "카테시안 트리 정렬",
  category: "special",
  desc: "최소 힙이면서 중위 순회가 원래 순서인 트리로 정렬",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
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

    const stack: number[] = [];
    for (let i = 0; i < n; i++) {
      let last = NIL;
      while (stack.length > 0 && t.cmp(stack[stack.length - 1], i, L.cmpBuild) > 0) last = stack.pop()!;
      left[i] = last;
      if (stack.length > 0) right[stack[stack.length - 1]] = i;
      stack.push(i);
    }
    const root = stack[0];

    const heap: number[] = [];
    const less = (a: number, b: number) => {
      const c = t.cmp(a, b, L.cmpHeap);
      return c < 0 || (c === 0 && a < b);
    };
    const push = (x: number) => {
      heap.push(x);
      for (let k = heap.length - 1; k > 0; ) {
        const p = (k - 1) >> 1;
        if (!less(heap[k], heap[p])) break;
        [heap[k], heap[p]] = [heap[p], heap[k]];
        k = p;
      }
    };
    const pop = () => {
      const top = heap[0];
      const last = heap.pop()!;
      if (heap.length > 0) {
        heap[0] = last;
        for (let k = 0; ; ) {
          const l = 2 * k + 1;
          const r = l + 1;
          let m = k;
          if (l < heap.length && less(heap[l], heap[m])) m = l;
          if (r < heap.length && less(heap[r], heap[m])) m = r;
          if (m === k) break;
          [heap[k], heap[m]] = [heap[m], heap[k]];
          k = m;
        }
      }
      return top;
    };

    const order: ArrayItem[] = [];
    push(root);
    while (heap.length > 0) {
      const x = pop();
      order.push(t.item(x));
      if (left[x] !== NIL) push(left[x]);
      if (right[x] !== NIL) push(right[x]);
    }
    t.arrange(0, order, L.move);
  },
};
