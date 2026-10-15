import type { ArrayItem } from "@/shared/model";
import type { BarHighlight } from "@/entities/array";

// ───────────── 힙 ─────────────

export function heapParent(i: number, arity: number) {
  return i === 0 ? -1 : Math.floor((i - 1) / arity);
}

/**
 * 완전 arity진 트리의 노드 위치.
 * x: 0~1 (그 층을 arity^depth칸으로 나눈 칸의 가운데), depth: 층 번호.
 */
export function heapLayout(n: number, arity: number): Array<{ x: number; depth: number }> {
  const layout: Array<{ x: number; depth: number }> = [];
  let depth = 0;
  let levelStart = 0;
  let levelSize = 1;
  for (let i = 0; i < n; i++) {
    if (i >= levelStart + levelSize) {
      levelStart += levelSize;
      levelSize *= arity;
      depth++;
    }
    layout.push({ x: (i - levelStart + 0.5) / levelSize, depth });
  }
  return layout;
}

/**
 * 현재 힙 크기 = n − (heapEndLabel 줄이 실행된 횟수).
 * 힙 정렬은 그 줄에서 루트(최댓값)를 힙 끝으로 보내고 힙을 하나 줄인다.
 */
export function heapSizeFromHits(
  n: number,
  lineHits: readonly number[],
  codeLabels: ReadonlyMap<number, string>,
  heapEndLabel: string
) {
  for (const [line, label] of codeLabels) {
    if (label === heapEndLabel) return Math.max(0, n - (lineHits[line] ?? 0));
  }
  return n;
}

// ───────────── 이진 검색 트리 ─────────────

export type Bst = {
  root: number;
  left: Int32Array;
  right: Int32Array;
  parent: Int32Array;
  depth: Int32Array;
  /** 중위 순회 순위 (= 정렬된 위치) */
  rank: Int32Array;
  maxDepth: number;
};

/** 트리 정렬과 같은 규칙(입력 순서대로, 같은 값은 오른쪽)으로 트리를 만든다. 반복문만 사용. */
export function buildBst(values: readonly number[]): Bst {
  const n = values.length;
  const left = new Int32Array(n).fill(-1);
  const right = new Int32Array(n).fill(-1);
  const parent = new Int32Array(n).fill(-1);
  const depth = new Int32Array(n);
  let maxDepth = 0;

  for (let i = 1; i < n; i++) {
    let node = 0;
    for (;;) {
      const goLeft = values[i] < values[node];
      const child = goLeft ? left[node] : right[node];
      if (child === -1) {
        if (goLeft) left[node] = i;
        else right[node] = i;
        parent[i] = node;
        depth[i] = depth[node] + 1;
        if (depth[i] > maxDepth) maxDepth = depth[i];
        break;
      }
      node = child;
    }
  }

  const rank = new Int32Array(n);
  const stack: number[] = [];
  let r = 0;
  for (let cur = n > 0 ? 0 : -1; cur !== -1 || stack.length > 0; ) {
    while (cur !== -1) {
      stack.push(cur);
      cur = left[cur];
    }
    const node = stack.pop()!;
    rank[node] = r++;
    cur = right[node];
  }

  return { root: n > 0 ? 0 : -1, left, right, parent, depth, rank, maxDepth };
}

export type BstProgress = {
  /** build: 트리에 넣는 중, arrange: 중위 순서로 배치하는 중, done: 끝 */
  phase: "build" | "arrange" | "done";
  /** 0..inserted-1 번째 입력이 트리에 들어가 있다 */
  inserted: number;
  /** 지금 넣고 있는 입력 인덱스 */
  inserting: number | null;
  /** 지금 비교하고 있는 트리 노드 (입력 인덱스) */
  comparing: number | null;
};

/**
 * 트리 정렬의 현재 진행 상태를 재생 정보만으로 알아낸다.
 * 트리를 만드는 동안 배열은 움직이지 않고, 비교는 항상 (넣는 원소, 트리 노드) 순서로 기록된다.
 */
export function bstProgress(n: number, cursor: number, highlight: BarHighlight, done = false): BstProgress {
  if (done || (cursor > 0 && highlight === null)) {
    return { phase: "done", inserted: n, inserting: null, comparing: null };
  }
  if (highlight?.tone === "compare") {
    const [inserting, comparing] = highlight.indices;
    return { phase: "build", inserted: inserting, inserting, comparing };
  }
  if (cursor === 0) return { phase: "build", inserted: Math.min(1, n), inserting: null, comparing: null };
  return { phase: "arrange", inserted: n, inserting: null, comparing: null };
}

/** 앞에서부터 목표 순서(id)와 같은 원소 수 = 이미 제자리에 놓인 수 */
export function placedPrefix(current: readonly ArrayItem[], targetIds: readonly number[]) {
  let k = 0;
  while (k < current.length && current[k].id === targetIds[k]) k++;
  return k;
}
