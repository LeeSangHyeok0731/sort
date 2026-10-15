import type { ArrayItem } from "@/shared/model";
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

/** 빈 자리(이미 뽑힌 선수) */
const NONE = -1;

const CODE = defineCode(`function tournamentSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  let size = 1;
  while (size < n) size *= 2;
  // 완전 이진 트리: 잎에 선수(인덱스), 내부 노드에 경기 승자. 이 동안 배열은 그대로
  const NONE = -1;
  const tree = new Array(2 * size).fill(NONE);
  for (let i = 0; i < n; i++) tree[size + i] = i;
  const play = (a, b) => {
    if (a === NONE) return b;
    if (b === NONE) return a;
    return arr[b] < arr[a] ? b : a; //@cmp-match
  };
  for (let k = size - 1; k >= 1; k--) tree[k] = play(tree[2 * k], tree[2 * k + 1]);
  // 우승자(최솟값)를 뽑고, 그 잎에서 루트까지만 다시 경기
  const order = [];
  for (let round = 0; round < n; round++) {
    const winner = tree[1];
    order.push(arr[winner]);
    let k = size + winner;
    tree[k] = NONE;
    for (k >>= 1; k >= 1; k >>= 1) tree[k] = play(tree[2 * k], tree[2 * k + 1]);
  }
  // 뽑힌 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  for (let k = 0; k < n; k++) {
    const from = arr.indexOf(order[k], k);
    arr.splice(k, 0, ...arr.splice(from, 1)); //@move
  }
  return arr;
}`);

const L = { cmpMatch: CODE.line("cmp-match"), move: CODE.line("move") };

export const tournamentSort: SortAlgorithm = {
  id: "tournament",
  name: "토너먼트 정렬",
  category: "special",
  desc: "대진표로 우승자(최솟값)를 뽑고 그 경로만 재경기",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
  },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  structure: { kind: "tournament" },
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    let size = 1;
    while (size < n) size *= 2;
    const tree = new Array<number>(2 * size).fill(NONE);
    for (let i = 0; i < n; i++) tree[size + i] = i;

    // 두 선수 중 작은 쪽이 승자 (같으면 왼쪽 → 안정 정렬)
    const play = (a: number, b: number) => {
      if (a === NONE) return b;
      if (b === NONE) return a;
      return t.cmp(b, a, L.cmpMatch) < 0 ? b : a;
    };
    for (let k = size - 1; k >= 1; k--) tree[k] = play(tree[2 * k], tree[2 * k + 1]);

    const order: ArrayItem[] = [];
    for (let round = 0; round < n; round++) {
      const winner = tree[1];
      order.push(t.item(winner));
      let k = size + winner;
      tree[k] = NONE;
      for (k >>= 1; k >= 1; k >>= 1) tree[k] = play(tree[2 * k], tree[2 * k + 1]);
    }
    t.arrange(0, order, L.move);
  },
};
