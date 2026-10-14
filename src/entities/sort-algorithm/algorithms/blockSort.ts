import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { insertionSortRange } from "./insertionSort";
import { lowerBound, rotate, rotationMerge, type RotationLines } from "./rotation";

const CHUNK = 16;

const CODE = defineCode(`// 블록 정렬 (WikiSort의 핵심을 단순화한 버전)
function blockSort(arr) {
  const n = arr.length;
  // 16개씩 삽입 정렬한 뒤, 이웃 구간을 블록 병합으로 합친다
  for (let i = 0; i < n; i += 16) insertionSort(arr, i, Math.min(i + 16, n));
  for (let width = 16; width < n; width *= 2) {
    for (let lo = 0; lo + width < n; lo += 2 * width) {
      const mid = lo + width, hi = Math.min(lo + 2 * width, n);
      if (arr[mid - 1] <= arr[mid]) continue; // 이미 순서가 맞음 //@cmp-ordered
      if (arr[lo] > arr[hi - 1]) rotate(arr, lo, mid, hi); // A 전체 > B 전체 //@cmp-reversed
      else blockMerge(arr, lo, mid, hi);
    }
  }
  return arr;
}

// A=[lo,mid)를 √|A| 크기 블록으로 나눠 B=[mid,hi) 사이로 굴려 넣는다
function blockMerge(arr, lo, mid, hi) {
  const lenA = mid - lo;
  const blockSize = Math.max(1, Math.floor(Math.sqrt(lenA)));
  let size = lenA % blockSize || blockSize; // 첫 블록이 나머지를 가져간다
  let aStart = lo, bStart = mid, lastA = null;
  while (aStart < bStart) {
    // B에서 현재 A 블록의 첫 값보다 작은 값들 [bStart, p)를
    const p = lowerBound(arr, bStart, hi, arr[aStart]);
    const taken = p - bStart;
    // 남은 A 블록들 앞으로 회전 (블록 굴리기)
    rotate(arr, aStart, bStart, p);
    // 직전에 내려놓은 A 블록과 방금 들어온 B 값들을 국소 병합
    if (lastA) mergeInPlace(arr, lastA[0], lastA[1], aStart + taken);
    lastA = [aStart + taken, aStart + taken + size];
    aStart = lastA[1];
    bStart = p;
    size = blockSize;
  }
  if (lastA) mergeInPlace(arr, lastA[0], lastA[1], hi);
}

// 보조 메모리 없는 안정 병합: 긴 쪽 가운데 기준으로 짧은 쪽을 이진 탐색해 회전 후 재귀
function mergeInPlace(arr, lo, mid, hi) {
  const len1 = mid - lo, len2 = hi - mid;
  if (len1 === 0 || len2 === 0) return;
  if (len1 + len2 === 2) {
    if (arr[mid] < arr[lo]) { //@cmp-pair
      [arr[lo], arr[mid]] = [arr[mid], arr[lo]]; //@swap-pair
    }
    return;
  }
  let cut1, cut2;
  if (len1 > len2) {
    cut1 = lo + (len1 >> 1);
    cut2 = lowerBound(arr, mid, hi, arr[cut1]);
  } else {
    cut2 = mid + (len2 >> 1);
    cut1 = upperBound(arr, lo, mid, arr[cut2]);
  }
  rotate(arr, cut1, mid, cut2);
  const newMid = cut1 + (cut2 - mid);
  mergeInPlace(arr, lo, cut1, newMid);
  mergeInPlace(arr, newMid, cut2, hi);
}

// [lo,mid)와 [mid,hi)의 순서를 바꾼다 (세 번 뒤집기)
function rotate(arr, lo, mid, hi) {
  if (lo >= mid || mid >= hi) return;
  reverse(arr, lo, mid);
  reverse(arr, mid, hi);
  reverse(arr, lo, hi);
}

function reverse(arr, lo, hi) {
  for (let i = lo, j = hi - 1; i < j; i++, j--) {
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap-reverse
  }
}

// [lo, hi)에서 x 이상인 첫 위치
function lowerBound(arr, lo, hi, x) {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < x) lo = mid + 1; //@cmp-lower
    else hi = mid;
  }
  return lo;
}

// [lo, hi)에서 x보다 큰 첫 위치
function upperBound(arr, lo, hi, x) {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= x) lo = mid + 1; //@cmp-upper
    else hi = mid;
  }
  return lo;
}

function insertionSort(arr, lo, hi) {
  for (let i = lo + 1; i < hi; i++) {
    for (let j = i; j > lo && arr[j - 1] > arr[j]; j--) { //@cmp-insert
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap-insert
    }
  }
}`);

const ROTATION: RotationLines = {
  swapReverse: CODE.line("swap-reverse"),
  cmpLower: CODE.line("cmp-lower"),
  cmpUpper: CODE.line("cmp-upper"),
  cmpPair: CODE.line("cmp-pair"),
  swapPair: CODE.line("swap-pair"),
};
const L = {
  cmpOrdered: CODE.line("cmp-ordered"),
  cmpReversed: CODE.line("cmp-reversed"),
  insert: { cmp: CODE.line("cmp-insert"), swap: CODE.line("swap-insert") },
};

/**
 * 정렬된 A=[lo, mid)와 B=[mid, hi)를 블록 단위로 병합한다.
 * A를 √|A| 크기 블록으로 나누고, 블록마다:
 *  1) B에서 이 블록의 첫 값보다 작은 값들을 찾아 남은 A 블록들 앞으로 회전시키고 (블록 굴리기)
 *  2) 직전에 내려놓은 A 블록과 그 사이 B 값들을 국소 병합한다.
 */
function blockMerge(t: Tracer, lo: number, mid: number, hi: number) {
  const lenA = mid - lo;
  const blockSize = Math.max(1, Math.floor(Math.sqrt(lenA)));
  const firstSize = lenA % blockSize || blockSize;

  let aStart = lo;
  let bStart = mid;
  let lastA: [number, number] | null = null;

  for (let size = firstSize; aStart < bStart; size = blockSize) {
    const p = lowerBound(t, bStart, hi, aStart, ROTATION.cmpLower);
    const taken = p - bStart;
    rotate(t, aStart, bStart, p, ROTATION.swapReverse);
    if (lastA) rotationMerge(t, lastA[0], lastA[1], aStart + taken, ROTATION);
    lastA = [aStart + taken, aStart + taken + size];
    aStart = lastA[1];
    bStart = p;
  }
  if (lastA) rotationMerge(t, lastA[0], lastA[1], hi, ROTATION);
}

export const blockSort: SortAlgorithm = {
  id: "block",
  name: "블록 정렬",
  category: "special",
  desc: "A를 √n 블록으로 나눠 B 사이로 굴려 넣는 제자리 안정 병합",
  complexity: {
    best: "O(n)",
    average: "O(n√n)",
    worst: "O(n√n)",
    space: "O(1)",
  },
  stable: true,
  note: "WikiSort의 핵심(블록 굴리기 + 국소 병합)을 단순화한 버전이에요. 원본은 태그와 내부 버퍼로 O(n log n)을 내지만, 여기서는 블록을 회전으로 옮겨 더 느립니다.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let i = 0; i < n; i += CHUNK) insertionSortRange(t, i, Math.min(i + CHUNK, n) - 1, L.insert);
    for (let width = CHUNK; width < n; width *= 2) {
      for (let lo = 0; lo + width < n; lo += 2 * width) {
        const mid = lo + width;
        const hi = Math.min(lo + 2 * width, n);
        if (t.cmp(mid - 1, mid, L.cmpOrdered) <= 0) continue;
        if (t.cmp(lo, hi - 1, L.cmpReversed) > 0) rotate(t, lo, mid, hi, ROTATION.swapReverse);
        else blockMerge(t, lo, mid, hi);
      }
    }
  },
};
