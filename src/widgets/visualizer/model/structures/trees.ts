/**
 * 배열 밖에 트리를 만드는 정렬들(스플레이·카테시안·토너먼트)의 구조를 같은 규칙으로 다시 계산한다.
 * 정렬 구현과 규칙이 같아야 하며, structures.test.ts가 실제 연산 기록과 맞는지 검사한다.
 */

export const NIL = -1;

export type TreeShape = {
  root: number;
  left: Int32Array;
  right: Int32Array;
  parent: Int32Array;
  /** 트리에 없는 노드는 -1 */
  depth: Int32Array;
};

function emptyShape(n: number): TreeShape {
  return {
    root: NIL,
    left: new Int32Array(n).fill(NIL),
    right: new Int32Array(n).fill(NIL),
    parent: new Int32Array(n).fill(NIL),
    depth: new Int32Array(n).fill(NIL),
  };
}

/** 루트부터 내려가며 깊이를 다시 매긴다 (재귀 없이) */
function fillDepths(shape: TreeShape) {
  shape.depth.fill(NIL);
  if (shape.root === NIL) return;
  const stack = [shape.root];
  shape.depth[shape.root] = 0;
  while (stack.length > 0) {
    const x = stack.pop()!;
    for (const c of [shape.left[x], shape.right[x]]) {
      if (c === NIL) continue;
      shape.depth[c] = shape.depth[x] + 1;
      stack.push(c);
    }
  }
}

/** 같은 값은 입력 순서대로 (안정) 정렬했을 때의 순위 = 이진 검색 트리의 중위 순서 */
export function stableRanks(values: readonly number[]): Int32Array {
  const order = values.map((_, i) => i).sort((a, b) => values[a] - values[b] || a - b);
  const rank = new Int32Array(values.length);
  order.forEach((index, r) => (rank[index] = r));
  return rank;
}

// ───────────── 스플레이 트리 ─────────────

/** 입력 0..count-1을 차례로 넣고 매번 루트로 끌어올린 스플레이 트리 (같은 값은 오른쪽) */
export function splayAfter(values: readonly number[], count: number): TreeShape {
  return simulateSplay(values, count);
}

/** 트리를 만드는 내내 가장 깊었던 층 (붙이는 순간 포함). 그릴 때 층 높이를 고정하는 데 쓴다 */
export function splayPeakDepth(values: readonly number[]): number {
  let peak = 0;
  simulateSplay(values, values.length, (pathLength) => (peak = Math.max(peak, pathLength)));
  return peak;
}

function simulateSplay(
  values: readonly number[],
  count: number,
  /** 새 노드를 붙인 직후 (끌어올리기 전) 그 노드의 깊이 */
  onAttach?: (depth: number) => void
): TreeShape {
  const shape = emptyShape(values.length);
  const { left, right, parent } = shape;
  if (count <= 0) return shape;
  shape.root = 0;

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
    if (g === NIL) shape.root = x;
    else if (left[g] === p) left[g] = x;
    else right[g] = x;
  };

  for (let i = 1; i < count; i++) {
    let node = shape.root;
    for (;;) {
      if (values[i] < values[node]) {
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
    if (onAttach) {
      let depth = 0;
      for (let x = i; parent[x] !== NIL; x = parent[x]) depth++;
      onAttach(depth);
    }
    while (parent[i] !== NIL) {
      const p = parent[i];
      const g = parent[p];
      if (g === NIL) rotateUp(i);
      else if ((left[g] === p) === (left[p] === i)) {
        rotateUp(p);
        rotateUp(i);
      } else {
        rotateUp(i);
        rotateUp(i);
      }
    }
  }
  fillDepths(shape);
  return shape;
}

/** 지금 트리에 i를 넣을 때 거치는 경로 (루트부터 붙을 부모까지) */
export function insertionPath(shape: TreeShape, values: readonly number[], i: number): number[] {
  const path: number[] = [];
  let node = shape.root;
  while (node !== NIL) {
    path.push(node);
    node = values[i] < values[node] ? shape.left[node] : shape.right[node];
  }
  return path;
}

// ───────────── 카테시안 트리 ─────────────

/** 입력 0..count-1로 만든 카테시안 트리 (최소 힙 + 중위 순회 = 원래 순서, 같은 값은 먼저 나온 쪽이 조상) */
export function cartesianPrefix(values: readonly number[], count: number): TreeShape {
  const shape = emptyShape(values.length);
  const stack: number[] = [];
  for (let i = 0; i < count; i++) {
    let last = NIL;
    while (stack.length > 0 && values[stack[stack.length - 1]] > values[i]) last = stack.pop()!;
    shape.left[i] = last;
    if (last !== NIL) shape.parent[last] = i;
    if (stack.length > 0) {
      const top = stack[stack.length - 1];
      shape.right[top] = i;
      shape.parent[i] = top;
    } else {
      shape.parent[i] = NIL;
    }
    stack.push(i);
  }
  shape.root = stack.length > 0 ? stack[0] : NIL;
  fillDepths(shape);
  return shape;
}

export type QueueState = {
  /** 이미 꺼낸 노드 (꺼낸 순서) */
  popped: number[];
  /** 우선순위 큐에 들어 있는 노드 */
  queued: number[];
  /** 아직 실행하지 않은 다음 비교 (a, b). 다 끝났으면 null */
  next: [number, number] | null;
};

class Stop extends Error {}

/**
 * 카테시안 트리 정렬의 꺼내기 단계를 비교 compares번째까지 다시 진행한다.
 * (루트를 넣고, 최솟값을 꺼낼 때마다 두 자식을 넣는 최소 힙. 같은 값이면 앞 인덱스 먼저)
 */
export function cartesianQueueAfter(values: readonly number[], compares: number): QueueState {
  const shape = cartesianPrefix(values, values.length);
  const heap: number[] = [];
  const popped: number[] = [];
  let used = 0;
  let next: [number, number] | null = null;

  const less = (a: number, b: number) => {
    if (used === compares) {
      next = [a, b];
      throw new Stop();
    }
    used++;
    const c = values[a] - values[b];
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
    popped.push(top);
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

  try {
    if (shape.root !== NIL) push(shape.root);
    while (heap.length > 0) {
      const x = pop();
      if (shape.left[x] !== NIL) push(shape.left[x]);
      if (shape.right[x] !== NIL) push(shape.right[x]);
    }
  } catch (e) {
    if (!(e instanceof Stop)) throw e;
  }
  return { popped, queued: [...heap], next };
}

// ───────────── 토너먼트 ─────────────

export type TournamentState = {
  /** 잎 수 (2의 거듭제곱) */
  size: number;
  /** 노드 k(1..2·size-1)의 승자 입력 인덱스, 없으면 -1. 잎은 size+i */
  winner: Int32Array;
  /** 이미 우승해 빠진 선수 (빠진 순서) */
  removed: number[];
  /** 아직 치르지 않은 다음 경기 (a, b)와 그 경기가 열리는 노드. 다 끝났으면 null */
  next: [number, number] | null;
  nextNode: number;
};

/** 토너먼트 정렬을 경기(비교) compares번까지 다시 진행한다 (같으면 왼쪽 승 → 안정) */
export function tournamentAfter(values: readonly number[], compares: number): TournamentState {
  const n = values.length;
  let size = 1;
  while (size < n) size *= 2;
  const winner = new Int32Array(2 * size).fill(NIL);
  for (let i = 0; i < n; i++) winner[size + i] = i;
  const removed: number[] = [];
  let used = 0;
  let next: [number, number] | null = null;
  let nextNode = NIL;

  const play = (k: number) => {
    const a = winner[2 * k];
    const b = winner[2 * k + 1];
    if (a === NIL) return b;
    if (b === NIL) return a;
    if (used === compares) {
      next = [b, a];
      nextNode = k;
      throw new Stop();
    }
    used++;
    return values[b] < values[a] ? b : a;
  };

  try {
    if (n >= 2) {
      for (let k = size - 1; k >= 1; k--) winner[k] = play(k);
      for (let round = 0; round < n; round++) {
        const champion = winner[1];
        removed.push(champion);
        let k = size + champion;
        winner[k] = NIL;
        for (k >>= 1; k >= 1; k >>= 1) winner[k] = play(k);
      }
    }
  } catch (e) {
    if (!(e instanceof Stop)) throw e;
  }
  return { size, winner, removed, next, nextNode };
}
