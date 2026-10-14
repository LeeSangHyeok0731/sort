import type { ArrayItem } from "@/shared/model";
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import { mergeRuns } from "./mergeSort";

const CODE = defineCode(`function patienceSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // 1) 카드를 한 장씩 "맨 위 카드가 자기 이상인" 가장 왼쪽 더미에 올린다
  //    (맨 위 카드들은 왼쪽부터 오름차순 → 이진 탐색). 이 단계에서 배열은 그대로
  const piles = [];
  for (let i = 0; i < n; i++) {
    let lo = 0, hi = piles.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      const top = piles[mid][piles[mid].length - 1];
      if (arr[top] >= arr[i]) hi = mid; //@cmp-pile
      else lo = mid + 1;
    }
    if (lo === piles.length) piles.push([]);
    piles[lo].push(i);
  }
  // 2) 각 더미를 위에서부터 꺼내 놓으면 오름차순 런이 된다
  const order = [], runs = [];
  for (const pile of piles) {
    const start = order.length;
    for (let k = pile.length - 1; k >= 0; k--) order.push(arr[pile[k]]);
    runs.push([start, order.length - 1]);
  }
  for (let k = 0; k < n; k++) {
    const from = arr.indexOf(order[k], k);
    arr.splice(k, 0, ...arr.splice(from, 1)); //@move-layout
  }
  // 3) 이웃한 런끼리 병합을 반복
  let current = runs;
  while (current.length > 1) {
    const merged = [];
    for (let k = 0; k < current.length; k += 2) {
      if (k + 1 < current.length) {
        merge(arr, current[k][0], current[k][1], current[k + 1][1]);
        merged.push([current[k][0], current[k + 1][1]]);
      } else {
        merged.push(current[k]);
      }
    }
    current = merged;
  }
  return arr;
}

// 보조 배열 없이 병합: 오른쪽 원소가 더 작으면 꺼내서 왼쪽 원소 앞에 끼워 넣는다
function merge(arr, left, mid, right) {
  let i = left, j = mid + 1;
  while (i < j && j <= right) {
    if (arr[j] < arr[i]) { //@cmp-merge
      arr.splice(i, 0, ...arr.splice(j, 1)); //@move-merge
      j++;
    }
    i++;
  }
}`);

const L = {
  cmpPile: CODE.line("cmp-pile"),
  moveLayout: CODE.line("move-layout"),
  merge: { cmp: CODE.line("cmp-merge"), move: CODE.line("move-merge") },
};

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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;

    const piles: number[][] = [];
    for (let i = 0; i < n; i++) {
      let lo = 0;
      let hi = piles.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        const top = piles[mid][piles[mid].length - 1];
        if (t.cmp(top, i, L.cmpPile) >= 0) hi = mid;
        else lo = mid + 1;
      }
      if (lo === piles.length) piles.push([]);
      piles[lo].push(i);
    }

    const order: ArrayItem[] = [];
    const runs: Array<[number, number]> = [];
    for (const pile of piles) {
      const start = order.length;
      for (let k = pile.length - 1; k >= 0; k--) order.push(t.item(pile[k]));
      runs.push([start, order.length - 1]);
    }
    t.arrange(0, order, L.moveLayout);

    let current = runs;
    while (current.length > 1) {
      const merged: Array<[number, number]> = [];
      for (let k = 0; k < current.length; k += 2) {
        if (k + 1 < current.length) {
          mergeRuns(t, current[k][0], current[k][1], current[k + 1][1], L.merge);
          merged.push([current[k][0], current[k + 1][1]]);
        } else {
          merged.push(current[k]);
        }
      }
      current = merged;
    }
  },
};
