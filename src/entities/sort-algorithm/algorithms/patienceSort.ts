import type { ArrayItem } from "@/shared/model";
import type { SortAlgorithm } from "../model/types";
import { mergeRuns } from "./mergeSort";
import { ALGO_CODE } from "./code";

export const patienceSort: SortAlgorithm = {
  id: "patience",
  name: "페이션스 정렬",
  category: "special",
  desc: "카드 게임처럼 더미를 쌓은 뒤 합침",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
  },
  stable: false,
  code: ALGO_CODE.patience,
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    // 1) 더미 쌓기: 각 카드를 "맨 위 카드가 자기 이상인" 가장 왼쪽 더미에 올린다.
    //    더미들의 맨 위 카드는 왼쪽부터 오름차순이므로 이진 탐색. (이 단계에선 배열이 움직이지 않는다)
    const piles: number[][] = [];
    for (let i = 0; i < n; i++) {
      let lo = 0;
      let hi = piles.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        const top = piles[mid][piles[mid].length - 1];
        if (t.cmp(top, i) >= 0) hi = mid;
        else lo = mid + 1;
      }
      if (lo === piles.length) piles.push([]);
      piles[lo].push(i);
    }

    // 2) 더미를 위에서부터 꺼내 놓으면 각각 오름차순 런이 된다
    const order: ArrayItem[] = [];
    const runEnds: number[] = [];
    for (const pile of piles) {
      for (let k = pile.length - 1; k >= 0; k--) order.push(t.item(pile[k]));
      runEnds.push(order.length - 1);
    }
    t.arrange(0, order);

    // 3) 런들을 이웃끼리 병합
    let runs = runEnds.map((end, k) => [k === 0 ? 0 : runEnds[k - 1] + 1, end]);
    while (runs.length > 1) {
      const merged: number[][] = [];
      for (let k = 0; k < runs.length; k += 2) {
        if (k + 1 < runs.length) {
          mergeRuns(t, runs[k][0], runs[k][1], runs[k + 1][1]);
          merged.push([runs[k][0], runs[k + 1][1]]);
        } else {
          merged.push(runs[k]);
        }
      }
      runs = merged;
    }
  },
};
