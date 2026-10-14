import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { heapSortRange } from "./heapSort";
import { insertionSortRange } from "./insertionSort";

const INSERTION_THRESHOLD = 24;
const NINTHER_THRESHOLD = 128;
const PARTIAL_INSERTION_LIMIT = 8;

const CODE = defineCode(`// pdqsort (Pattern-defeating quicksort)
function pdqsort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  pdq(arr, 0, n, Math.floor(Math.log2(n)), true);
  return arr;
}

function pdq(arr, lo, hi, badAllowed, leftmost) {
  for (;;) {
    const size = hi - lo;
    // 작은 구간은 삽입 정렬
    if (size < 24) return insertionSort(arr, lo, hi);

    // 피벗: 세 값의 중앙값 (큰 구간은 "중앙값들의 중앙값") → lo로
    const half = Math.floor(size / 2);
    if (size > 128) {
      sort3(arr, lo, lo + half, hi - 1);
      sort3(arr, lo + 1, lo + half - 1, hi - 2);
      sort3(arr, lo + 2, lo + half + 1, hi - 3);
      sort3(arr, lo + half - 1, lo + half, lo + half + 1);
      [arr[lo], arr[lo + half]] = [arr[lo + half], arr[lo]]; //@swap-ninther
    } else {
      sort3(arr, lo + half, lo, hi - 1); // 중앙값이 lo로
    }

    // 왼쪽 이웃(이전 피벗)과 피벗이 같으면 같은 값 묶음을 한 번에 건너뛴다
    if (!leftmost && arr[lo - 1] >= arr[lo]) { //@cmp-prev
      lo = partitionLeft(arr, lo, hi) + 1;
      continue;
    }

    const [p, alreadyPartitioned] = partitionRight(arr, lo, hi);
    const leftSize = p - lo, rightSize = hi - (p + 1);

    if (leftSize < size / 8 || rightSize < size / 8) {
      // 분할이 크게 치우쳤다: 너무 자주면 힙 정렬로 전환 (최악 O(n log n) 보장)
      if (--badAllowed === 0) return heapSort(arr, lo, hi);
      // 아니면 원소 몇 개를 섞어 반복 패턴을 깬다
      breakPatterns(arr, lo, p);
      breakPatterns(arr, p + 1, hi);
    } else if (alreadyPartitioned) {
      // 교환이 한 번도 없었다 = 이미 정렬돼 있을 가능성이 크다
      if (partialInsertionSort(arr, lo, p) && partialInsertionSort(arr, p + 1, hi)) return;
    }

    pdq(arr, lo, p, badAllowed, leftmost); // 왼쪽은 재귀
    lo = p + 1; // 오른쪽은 반복
    leftmost = false;
  }
}

// 피벗(arr[lo])보다 작은 값은 왼쪽, 같거나 큰 값은 오른쪽
function partitionRight(arr, lo, hi) {
  let i = lo + 1, j = hi - 1, swapped = false;
  for (;;) {
    while (i <= j && arr[i] < arr[lo]) i++; //@cmp-right-i
    while (i <= j && arr[j] >= arr[lo]) j--; //@cmp-right-j
    if (i > j) break;
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap-right
    i++;
    j--;
    swapped = true;
  }
  [arr[lo], arr[j]] = [arr[j], arr[lo]]; //@swap-right-pivot
  return [j, !swapped];
}

// 피벗과 같은 값을 왼쪽으로 모은다 (왼쪽 구간 전체가 피벗과 같은 값)
function partitionLeft(arr, lo, hi) {
  let i = lo + 1, j = hi - 1;
  for (;;) {
    while (i <= j && arr[i] <= arr[lo]) i++; //@cmp-left-i
    while (i <= j && arr[j] > arr[lo]) j--; //@cmp-left-j
    if (i > j) break;
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap-left
    i++;
    j--;
  }
  [arr[lo], arr[j]] = [arr[j], arr[lo]]; //@swap-left-pivot
  return j;
}

// 삽입 정렬을 시도하되 옮긴 횟수가 8번을 넘으면 포기한다
function partialInsertionSort(arr, lo, hi) {
  let moved = 0;
  for (let i = lo + 1; i < hi; i++) {
    for (let j = i; j > lo && arr[j - 1] > arr[j]; j--) { //@cmp-partial
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap-partial
      moved++;
    }
    if (moved > 8) return false;
  }
  return true;
}

// arr[a] <= arr[b] <= arr[c] 가 되도록 세 위치를 정렬
function sort3(arr, a, b, c) {
  cmpSwap(arr, a, b);
  cmpSwap(arr, b, c);
  cmpSwap(arr, a, b);
}

function cmpSwap(arr, i, j) {
  if (arr[i] > arr[j]) { //@cmp-sort3
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap-sort3
  }
}

// 몇 원소를 섞어 다음 피벗이 또 나빠지지 않게 한다
function breakPatterns(arr, lo, hi) {
  const size = hi - lo;
  if (size < 24) return;
  const q = Math.floor(size / 4);
  const pairs = [[lo, lo + q], [hi - 1, hi - q]];
  if (size > 128) {
    pairs.push([lo + 1, lo + q + 1], [lo + 2, lo + q + 2], [hi - 2, hi - q - 1], [hi - 3, hi - q - 2]);
  }
  for (const [a, b] of pairs) [arr[a], arr[b]] = [arr[b], arr[a]]; //@swap-break
}

function insertionSort(arr, lo, hi) {
  for (let i = lo + 1; i < hi; i++) {
    for (let j = i; j > lo && arr[j - 1] > arr[j]; j--) { //@cmp-insert
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap-insert
    }
  }
}

// [lo, hi) 구간 힙 정렬
function heapSort(arr, lo, hi) {
  const size = hi - lo;
  for (let i = Math.floor(size / 2) - 1; i >= 0; i--) siftDown(arr, lo, size, i);
  for (let end = size - 1; end > 0; end--) {
    [arr[lo], arr[lo + end]] = [arr[lo + end], arr[lo]]; //@swap-heap-root
    siftDown(arr, lo, end, 0);
  }
}

function siftDown(arr, lo, size, i) {
  for (;;) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && arr[lo + l] > arr[lo + largest]) largest = l; //@cmp-heap-left
    if (r < size && arr[lo + r] > arr[lo + largest]) largest = r; //@cmp-heap-right
    if (largest === i) return;
    [arr[lo + i], arr[lo + largest]] = [arr[lo + largest], arr[lo + i]]; //@swap-heap-down
    i = largest;
  }
}`);

const L = {
  swapNinther: CODE.line("swap-ninther"),
  cmpPrev: CODE.line("cmp-prev"),
  cmpRightI: CODE.line("cmp-right-i"),
  cmpRightJ: CODE.line("cmp-right-j"),
  swapRight: CODE.line("swap-right"),
  swapRightPivot: CODE.line("swap-right-pivot"),
  cmpLeftI: CODE.line("cmp-left-i"),
  cmpLeftJ: CODE.line("cmp-left-j"),
  swapLeft: CODE.line("swap-left"),
  swapLeftPivot: CODE.line("swap-left-pivot"),
  cmpPartial: CODE.line("cmp-partial"),
  swapPartial: CODE.line("swap-partial"),
  cmpSort3: CODE.line("cmp-sort3"),
  swapSort3: CODE.line("swap-sort3"),
  swapBreak: CODE.line("swap-break"),
  insert: { cmp: CODE.line("cmp-insert"), swap: CODE.line("swap-insert") },
  heap: {
    cmpLeft: CODE.line("cmp-heap-left"),
    cmpRight: CODE.line("cmp-heap-right"),
    swapDown: CODE.line("swap-heap-down"),
    swapRoot: CODE.line("swap-heap-root"),
  },
};

function cmpSwap(t: Tracer, i: number, j: number) {
  if (t.cmp(i, j, L.cmpSort3) > 0) t.swap(i, j, L.swapSort3);
}

/** a ≤ b ≤ c 가 되도록 세 위치를 정렬한다 */
function sort3(t: Tracer, a: number, b: number, c: number) {
  cmpSwap(t, a, b);
  cmpSwap(t, b, c);
  cmpSwap(t, a, b);
}

/** 삽입 정렬을 시도하되 옮긴 횟수가 한도를 넘으면 포기한다. [lo, hi) 구간. */
function partialInsertionSort(t: Tracer, lo: number, hi: number) {
  let moved = 0;
  for (let i = lo + 1; i < hi; i++) {
    for (let j = i; j > lo && t.cmp(j - 1, j, L.cmpPartial) > 0; j--) {
      t.swap(j - 1, j, L.swapPartial);
      moved++;
    }
    if (moved > PARTIAL_INSERTION_LIMIT) return false;
  }
  return true;
}

/** lo의 피벗 기준으로 [lo, hi)를 나눈다. 피벗과 같은 값은 오른쪽. [피벗 위치, 이미 나뉘어 있었는지] */
function partitionRight(t: Tracer, lo: number, hi: number): [number, boolean] {
  let i = lo + 1;
  let j = hi - 1;
  let swapped = false;
  for (;;) {
    while (i <= j && t.cmp(i, lo, L.cmpRightI) < 0) i++;
    while (i <= j && t.cmp(j, lo, L.cmpRightJ) >= 0) j--;
    if (i > j) break;
    t.swap(i++, j--, L.swapRight);
    swapped = true;
  }
  t.swap(lo, j, L.swapRightPivot);
  return [j, !swapped];
}

/** 피벗과 같은 값은 왼쪽으로 모은다 */
function partitionLeft(t: Tracer, lo: number, hi: number) {
  let i = lo + 1;
  let j = hi - 1;
  for (;;) {
    while (i <= j && t.cmp(i, lo, L.cmpLeftI) <= 0) i++;
    while (i <= j && t.cmp(j, lo, L.cmpLeftJ) > 0) j--;
    if (i > j) break;
    t.swap(i++, j--, L.swapLeft);
  }
  t.swap(lo, j, L.swapLeftPivot);
  return j;
}

function breakPatterns(t: Tracer, lo: number, hi: number) {
  const size = hi - lo;
  if (size < INSERTION_THRESHOLD) return;
  const q = Math.floor(size / 4);
  const pairs: Array<[number, number]> = [
    [lo, lo + q],
    [hi - 1, hi - q],
  ];
  if (size > NINTHER_THRESHOLD) {
    pairs.push([lo + 1, lo + q + 1], [lo + 2, lo + q + 2], [hi - 2, hi - q - 1], [hi - 3, hi - q - 2]);
  }
  for (const [a, b] of pairs) t.swap(a, b, L.swapBreak);
}

function pdq(t: Tracer, lo: number, hi: number, badAllowed: number, leftmost: boolean) {
  for (;;) {
    const size = hi - lo;
    if (size < INSERTION_THRESHOLD) {
      insertionSortRange(t, lo, hi - 1, L.insert);
      return;
    }

    const half = Math.floor(size / 2);
    if (size > NINTHER_THRESHOLD) {
      sort3(t, lo, lo + half, hi - 1);
      sort3(t, lo + 1, lo + half - 1, hi - 2);
      sort3(t, lo + 2, lo + half + 1, hi - 3);
      sort3(t, lo + half - 1, lo + half, lo + half + 1);
      t.swap(lo, lo + half, L.swapNinther);
    } else {
      sort3(t, lo + half, lo, hi - 1);
    }

    if (!leftmost && t.cmp(lo - 1, lo, L.cmpPrev) >= 0) {
      lo = partitionLeft(t, lo, hi) + 1;
      continue;
    }

    const [p, alreadyPartitioned] = partitionRight(t, lo, hi);
    const leftSize = p - lo;
    const rightSize = hi - (p + 1);

    if (leftSize < size / 8 || rightSize < size / 8) {
      if (--badAllowed === 0) {
        heapSortRange(t, lo, hi - 1, L.heap);
        return;
      }
      breakPatterns(t, lo, p);
      breakPatterns(t, p + 1, hi);
    } else if (alreadyPartitioned) {
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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    pdq(t, 0, n, Math.floor(Math.log2(n)), true);
  },
};
