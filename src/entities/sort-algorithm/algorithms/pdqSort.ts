import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { heapSortRange } from "./heapSort";
import { insertionSortRange } from "./insertionSort";
import { ALGO_CODE } from "./code";

const INSERTION_THRESHOLD = 24;
const NINTHER_THRESHOLD = 128;
const PARTIAL_INSERTION_LIMIT = 8;

/** a ≤ b ≤ c 가 되도록 세 위치를 정렬한다 */
function sort3(t: Tracer, a: number, b: number, c: number) {
  if (t.cmp(b, a) < 0) t.swap(a, b);
  if (t.cmp(c, b) < 0) t.swap(b, c);
  if (t.cmp(b, a) < 0) t.swap(a, b);
}

/**
 * 삽입 정렬을 시도하되 원소를 옮긴 횟수가 한도를 넘으면 포기한다.
 * 이미 거의 정렬된 구간을 O(n)에 끝내기 위한 장치. [lo, hi) 구간.
 */
function partialInsertionSort(t: Tracer, lo: number, hi: number) {
  let moved = 0;
  for (let i = lo + 1; i < hi; i++) {
    let j = i;
    while (j > lo && t.cmp(j - 1, j) > 0) {
      t.swap(j - 1, j);
      j--;
      moved++;
    }
    if (moved > PARTIAL_INSERTION_LIMIT) return false;
  }
  return true;
}

/**
 * lo의 피벗 기준으로 [lo, hi)를 나눈다. 피벗과 같은 값은 오른쪽.
 * 반환: [피벗 최종 위치, 교환 없이 이미 나뉘어 있었는지]
 */
function partitionRight(t: Tracer, lo: number, hi: number): [number, boolean] {
  let i = lo + 1;
  let j = hi - 1;
  let swapped = false;
  for (;;) {
    while (i <= j && t.cmp(i, lo) < 0) i++;
    while (i <= j && t.cmp(j, lo) >= 0) j--;
    if (i > j) break;
    t.swap(i++, j--);
    swapped = true;
  }
  t.swap(lo, j);
  return [j, !swapped];
}

/** 피벗과 같은 값은 왼쪽으로 모은다 (왼쪽 구간 전체가 피벗과 같은 값이 된다) */
function partitionLeft(t: Tracer, lo: number, hi: number) {
  let i = lo + 1;
  let j = hi - 1;
  for (;;) {
    while (i <= j && t.cmp(i, lo) <= 0) i++;
    while (i <= j && t.cmp(j, lo) > 0) j--;
    if (i > j) break;
    t.swap(i++, j--);
  }
  t.swap(lo, j);
  return j;
}

/** 패턴 깨기: 분할이 크게 치우치면 몇 원소를 섞어 다음 피벗이 나빠지지 않게 한다 */
function breakPatterns(t: Tracer, lo: number, hi: number) {
  const size = hi - lo;
  if (size < INSERTION_THRESHOLD) return;
  const q = Math.floor(size / 4);
  t.swap(lo, lo + q);
  t.swap(hi - 1, hi - q);
  if (size > NINTHER_THRESHOLD) {
    t.swap(lo + 1, lo + q + 1);
    t.swap(lo + 2, lo + q + 2);
    t.swap(hi - 2, hi - q - 1);
    t.swap(hi - 3, hi - q - 2);
  }
}

function pdq(t: Tracer, lo: number, hi: number, badAllowed: number, leftmost: boolean) {
  for (;;) {
    const size = hi - lo;
    if (size < INSERTION_THRESHOLD) {
      insertionSortRange(t, lo, hi - 1);
      return;
    }

    // 피벗 선택: 세 값의 중앙값, 크면 "중앙값들의 중앙값"(ninther) → lo로
    const half = Math.floor(size / 2);
    if (size > NINTHER_THRESHOLD) {
      sort3(t, lo, lo + half, hi - 1);
      sort3(t, lo + 1, lo + half - 1, hi - 2);
      sort3(t, lo + 2, lo + half + 1, hi - 3);
      sort3(t, lo + half - 1, lo + half, lo + half + 1);
      t.swap(lo, lo + half);
    } else {
      sort3(t, lo + half, lo, hi - 1);
    }

    // 왼쪽 이웃(이전 피벗)과 피벗이 같으면 같은 값 묶음을 한 번에 건너뛴다
    if (!leftmost && t.cmp(lo - 1, lo) >= 0) {
      lo = partitionLeft(t, lo, hi) + 1;
      continue;
    }

    const [p, alreadyPartitioned] = partitionRight(t, lo, hi);
    const leftSize = p - lo;
    const rightSize = hi - (p + 1);
    const unbalanced = leftSize < size / 8 || rightSize < size / 8;

    if (unbalanced) {
      // 나쁜 분할이 너무 많으면 힙 정렬로 전환해 O(n log n)을 보장
      if (--badAllowed === 0) {
        heapSortRange(t, lo, hi - 1);
        return;
      }
      breakPatterns(t, lo, p);
      breakPatterns(t, p + 1, hi);
    } else if (alreadyPartitioned) {
      // 교환이 없었다 = 이미 정렬돼 있을 가능성이 크다
      if (partialInsertionSort(t, lo, p) && partialInsertionSort(t, p + 1, hi)) return;
    }

    pdq(t, lo, p, badAllowed, leftmost);
    lo = p + 1;
    leftmost = false;
  }
}

export const pdqSort: SortAlgorithm = {
  id: "pdq",
  name: "pdqsort",
  category: "special",
  desc: "패턴을 감지하는 퀵 정렬 (Rust 등의 기본 불안정 정렬)",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(log n)",
  },
  stable: false,
  code: ALGO_CODE.pdq,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    pdq(t, 0, n, Math.floor(Math.log2(n)), true);
  },
};
