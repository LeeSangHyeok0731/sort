import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

/**
 * 야콥스탈 순서로 넣을 대기 원소의 순서 (0번 제외, 0-기반).
 * 경계 t_k = (2^(k+1) + (-1)^k) / 3 = 1, 3, 5, 11, 21, 43, ...
 * 각 묶음 (t_(k-1), t_k]을 큰 번호부터 넣으면 이진 탐색 범위가 항상 2^k - 1 이하가 된다.
 */
export function jacobsthalInsertionOrder(count: number): number[] {
  const order: number[] = [];
  let prev = 1;
  for (let k = 2; prev < count; k++) {
    const boundary = (2 ** (k + 1) + (k % 2 === 0 ? 1 : -1)) / 3;
    for (let j = Math.min(boundary, count); j > prev; j--) order.push(j - 1);
    prev = boundary;
  }
  return order;
}

const CODE = defineCode(`// Ford–Johnson 머지-삽입 정렬: 비교 횟수를 최소에 가깝게
function mergeInsertionSort(arr) {
  // 원소를 인덱스로 다룬다 (같은 값이 있어도 짝을 구분, 배열은 마지막까지 그대로)
  const order = fordJohnson(arr, arr.map((_, i) => i)).map((i) => arr[i]);
  // 정해진 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  for (let k = 0; k < order.length; k++) {
    const from = arr.indexOf(order[k], k);
    arr.splice(k, 0, ...arr.splice(from, 1)); //@move
  }
  return arr;
}

function fordJohnson(arr, items) {
  const n = items.length;
  if (n <= 1) return items;

  // 1) 둘씩 짝지어 비교: 큰 쪽과 작은 쪽
  const partner = new Map();
  const larger = [];
  for (let k = 0; k + 1 < n; k += 2) {
    const [a, b] = [items[k], items[k + 1]];
    const [big, small] = arr[a] < arr[b] ? [b, a] : [a, b]; //@cmp-pair
    larger.push(big);
    partner.set(big, small);
  }
  const straggler = n % 2 === 1 ? items[n - 1] : undefined;

  // 2) 큰 쪽들을 재귀로 정렬 → 주 사슬
  const sortedLarger = fordJohnson(arr, larger);
  const chain = [...sortedLarger];
  const pend = sortedLarger.map((a) => partner.get(a));
  if (straggler !== undefined) pend.push(straggler);

  // 3) 첫 대기 원소는 짝(사슬의 최솟값)보다 작으므로 비교 없이 맨 앞
  chain.unshift(pend[0]);

  // 4) 나머지를 야콥스탈 순서(b3,b2, b5,b4, b11..b6, ...)로,
  //    자기 짝보다 앞부분에만 이진 삽입 → 탐색 범위가 항상 2^k - 1 이하
  for (const idx of jacobsthalOrder(pend.length)) {
    const b = pend[idx];
    const hi0 = idx < sortedLarger.length ? chain.indexOf(sortedLarger[idx]) : chain.length;
    let lo = 0, hi = hi0;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (arr[b] < arr[chain[mid]]) hi = mid; //@cmp-insert
      else lo = mid + 1;
    }
    chain.splice(lo, 0, b);
  }
  return chain;
}

// t_k = (2^(k+1) + (-1)^k) / 3 = 1, 3, 5, 11, 21, ... 묶음별로 큰 번호부터
function jacobsthalOrder(count) {
  const order = [];
  let prev = 1;
  for (let k = 2; prev < count; k++) {
    const t = (2 ** (k + 1) + (k % 2 === 0 ? 1 : -1)) / 3;
    for (let j = Math.min(t, count); j > prev; j--) order.push(j - 1);
    prev = t;
  }
  return order;
}`);

const L = { cmpPair: CODE.line("cmp-pair"), cmpInsert: CODE.line("cmp-insert"), move: CODE.line("move") };

/** 인덱스 목록을 Ford–Johnson 방식으로 정렬해 반환한다 (배열은 움직이지 않고 비교만 기록) */
function fordJohnson(t: Tracer, items: number[]): number[] {
  const n = items.length;
  if (n <= 1) return items;

  const partner = new Map<number, number>();
  const larger: number[] = [];
  for (let k = 0; k + 1 < n; k += 2) {
    const [a, b] = [items[k], items[k + 1]];
    const [big, small] = t.cmp(a, b, L.cmpPair) < 0 ? [b, a] : [a, b];
    larger.push(big);
    partner.set(big, small);
  }
  const straggler = n % 2 === 1 ? items[n - 1] : undefined;

  const sortedLarger = fordJohnson(t, larger);
  const chain = [...sortedLarger];
  const pend = sortedLarger.map((a) => partner.get(a)!);
  if (straggler !== undefined) pend.push(straggler);

  chain.unshift(pend[0]);

  for (const idx of jacobsthalInsertionOrder(pend.length)) {
    const b = pend[idx];
    let hi = idx < sortedLarger.length ? chain.indexOf(sortedLarger[idx]) : chain.length;
    let lo = 0;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (t.cmp(b, chain[mid], L.cmpInsert) < 0) hi = mid;
      else lo = mid + 1;
    }
    chain.splice(lo, 0, b);
  }
  return chain;
}

export const mergeInsertionSort: SortAlgorithm = {
  id: "mergeInsertion",
  name: "머지-삽입 정렬",
  category: "special",
  desc: "비교 횟수를 이론적 최소에 가깝게 줄인 Ford–Johnson 알고리즘",
  complexity: {
    best: "O(n log n) 비교",
    average: "O(n log n) 비교",
    worst: "Σ⌈log₂(3k/4)⌉ 비교",
    space: "O(n)",
  },
  stable: false,
  note: "비교 횟수를 최소로 줄이는 게 목적이라, 원소를 옮기는 비용은 신경 쓰지 않아요. 비교만 하다가 마지막에 한 번에 제자리로 옮깁니다.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const order = fordJohnson(
      t,
      Array.from({ length: t.length }, (_, i) => i)
    );
    t.arrange(
      0,
      order.map((i) => t.item(i)),
      L.move
    );
  },
};
