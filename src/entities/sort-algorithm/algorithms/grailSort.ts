import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { insertionSortRange } from "./insertionSort";
import { lowerBound, rotationMerge, type RotationLines } from "./rotation";

const CODE = defineCode(`// 그레일 정렬 (GrailSort의 핵심을 단순화한 버전)
function grailSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // 1) 키 모으기: 서로 다른 값의 첫 등장을 앞쪽으로 (정렬된 상태 유지)
  //    이 키들을 병합할 때 내부 버퍼(교환용 빈자리)로 쓴다
  const keys = collectKeys(arr, Math.max(1, Math.floor(Math.sqrt(n))));

  // 2) 나머지를 상향식 병합. 왼쪽 런이 버퍼에 들어가면 버퍼 병합, 아니면 회전 병합
  for (let width = 1; keys + width < n; width *= 2) {
    for (let lo = keys; lo + width < n; lo += 2 * width) {
      const mid = lo + width, hi = Math.min(lo + 2 * width, n);
      if (arr[mid - 1] <= arr[mid]) continue; //@cmp-ordered
      if (width <= keys) bufferedMerge(arr, lo, mid, hi);
      else mergeInPlace(arr, lo, mid, hi);
    }
  }

  // 3) 섞인 키를 정렬하고 나머지와 병합 (키는 각 값의 첫 등장이라 앞에 와도 안정)
  for (let i = 1; i < keys; i++) {
    for (let j = i; j > 0 && arr[j - 1] > arr[j]; j--) { //@cmp-insert
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap-insert
    }
  }
  mergeInPlace(arr, 0, keys, n);
  return arr;
}

function collectKeys(arr, wanted) {
  let keys = 1;
  for (let i = 1; i < arr.length && keys < wanted; i++) {
    const pos = lowerBound(arr, 0, keys, arr[i]);
    if (pos < keys && arr[pos] === arr[i]) continue; // 이미 같은 값의 키가 있다 //@cmp-key
    // arr[i]를 키 영역의 pos로 옮긴다 (사이 원소들은 한 칸씩 밀릴 뿐 순서 유지)
    arr.splice(pos, 0, ...arr.splice(i, 1)); //@move-key
    keys++;
  }
  return keys;
}

// 버퍼를 빈자리로 쓰는 병합
function bufferedMerge(arr, lo, mid, hi) {
  const lenA = mid - lo;
  // A를 버퍼 자리 [0, lenA)와 맞바꾼다
  for (let k = 0; k < lenA; k++) {
    [arr[k], arr[lo + k]] = [arr[lo + k], arr[k]]; //@swap-buffer
  }
  // 버퍼 쪽 A와 B를 비교하며, 결과 자리(out)와 교환해 채운다
  let i = 0, j = mid, out = lo;
  while (i < lenA && j < hi) {
    if (arr[j] < arr[i]) { //@cmp-buffered
      [arr[out], arr[j]] = [arr[j], arr[out]]; //@swap-from-b
      out++;
      j++;
    } else {
      [arr[out], arr[i]] = [arr[i], arr[out]]; //@swap-from-a
      out++;
      i++;
    }
  }
  while (i < lenA) {
    [arr[out], arr[i]] = [arr[i], arr[out]]; //@swap-rest
    out++;
    i++;
  }
  // 버퍼 값(키)은 순서만 섞인 채 버퍼 자리로 돌아와 있다
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
  insert: { cmp: CODE.line("cmp-insert"), swap: CODE.line("swap-insert") },
  cmpKey: CODE.line("cmp-key"),
  moveKey: CODE.line("move-key"),
  swapBuffer: CODE.line("swap-buffer"),
  cmpBuffered: CODE.line("cmp-buffered"),
  swapFromB: CODE.line("swap-from-b"),
  swapFromA: CODE.line("swap-from-a"),
  swapRest: CODE.line("swap-rest"),
};

/** 서로 다른 값의 "첫 등장"을 앞쪽 [0, keys)로 모은다 (정렬된 상태로 유지). */
function collectKeys(t: Tracer, wanted: number) {
  let keys = 1;
  for (let i = 1; i < t.length && keys < wanted; i++) {
    const pos = lowerBound(t, 0, keys, i, ROTATION.cmpLower);
    if (pos < keys && t.cmp(pos, i, L.cmpKey) === 0) continue;
    t.move(i, pos, L.moveKey);
    keys++;
  }
  return keys;
}

/** 버퍼 [0, |A|)를 빈자리로 써서 A=[lo, mid)와 B=[mid, hi)를 병합한다. */
function bufferedMerge(t: Tracer, lo: number, mid: number, hi: number) {
  const lenA = mid - lo;
  for (let k = 0; k < lenA; k++) t.swap(k, lo + k, L.swapBuffer);
  let i = 0;
  let j = mid;
  let out = lo;
  while (i < lenA && j < hi) {
    if (t.cmp(j, i, L.cmpBuffered) < 0) t.swap(out++, j++, L.swapFromB);
    else t.swap(out++, i++, L.swapFromA);
  }
  while (i < lenA) t.swap(out++, i++, L.swapRest);
}

export const grailSort: SortAlgorithm = {
  id: "grail",
  name: "그레일 정렬",
  category: "special",
  desc: "고유한 값들을 모아 내부 버퍼로 쓰는 제자리 안정 정렬",
  complexity: {
    best: "O(n log n)",
    average: "O(n log² n)",
    worst: "O(n log² n)",
    space: "O(1)",
  },
  stable: true,
  note: "GrailSort의 핵심(키 모으기 → 내부 버퍼 병합 → 키 재정렬·재병합)을 단순화한 버전이에요. 버퍼보다 긴 구간은 블록 병합 대신 회전 병합을 씁니다.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    const keys = collectKeys(t, Math.max(1, Math.floor(Math.sqrt(n))));

    for (let width = 1; keys + width < n; width *= 2) {
      for (let lo = keys; lo + width < n; lo += 2 * width) {
        const mid = lo + width;
        const hi = Math.min(lo + 2 * width, n);
        if (t.cmp(mid - 1, mid, L.cmpOrdered) <= 0) continue;
        if (width <= keys) bufferedMerge(t, lo, mid, hi);
        else rotationMerge(t, lo, mid, hi, ROTATION);
      }
    }

    insertionSortRange(t, 0, keys - 1, L.insert);
    rotationMerge(t, 0, keys, n, ROTATION);
  },
};
