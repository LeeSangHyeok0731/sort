import type { ArrayItem } from "@/shared/model";
import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

/** 빈 자리(이미 뽑힌 선수) */
const NONE = -1;

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
  code: ALGO_CODE.tournament,
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    // 완전 이진 트리: 잎 [size, 2·size)에 선수(배열 인덱스), 내부 노드에 경기 승자
    let size = 1;
    while (size < n) size *= 2;
    const tree = new Array<number>(2 * size).fill(NONE);
    for (let i = 0; i < n; i++) tree[size + i] = i;

    // 두 선수 중 작은 쪽이 승자 (같으면 왼쪽 → 안정 정렬)
    const play = (a: number, b: number) => {
      if (a === NONE) return b;
      if (b === NONE) return a;
      return t.cmp(b, a) < 0 ? b : a;
    };
    for (let k = size - 1; k >= 1; k--) tree[k] = play(tree[2 * k], tree[2 * k + 1]);

    // 우승자를 뽑고, 그 선수의 잎부터 루트까지만 다시 경기한다 (배열은 마지막에 한 번에 배치)
    const order: ArrayItem[] = [];
    for (let round = 0; round < n; round++) {
      const winner = tree[1];
      order.push(t.item(winner));
      let k = size + winner;
      tree[k] = NONE;
      for (k >>= 1; k >= 1; k >>= 1) tree[k] = play(tree[2 * k], tree[2 * k + 1]);
    }
    t.arrange(0, order);
  },
};
