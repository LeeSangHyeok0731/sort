import type { Tracer } from "../model/tracer";

/** 회전 병합이 기록할 설명 코드 줄 번호 (선택) */
export type RotationLines = {
  /** reverse 안의 교환 */
  swapReverse: number;
  /** lowerBound 안의 비교 */
  cmpLower: number;
  /** upperBound 안의 비교 */
  cmpUpper: number;
  /** 원소 2개 구간의 비교·교환 */
  cmpPair: number;
  swapPair: number;
};

export const NO_ROTATION_LINES: RotationLines = {
  swapReverse: 0,
  cmpLower: 0,
  cmpUpper: 0,
  cmpPair: 0,
  swapPair: 0,
};

/** [lo, hi) 구간을 뒤집는다 */
export function reverseRange(t: Tracer, lo: number, hi: number, line = 0) {
  for (let i = lo, j = hi - 1; i < j; i++, j--) t.swap(i, j, line);
}

/** [lo, mid)와 [mid, hi)의 순서를 바꾼다 (세 번 뒤집기, 보조 메모리 없음) */
export function rotate(t: Tracer, lo: number, mid: number, hi: number, line = 0) {
  if (lo >= mid || mid >= hi) return;
  reverseRange(t, lo, mid, line);
  reverseRange(t, mid, hi, line);
  reverseRange(t, lo, hi, line);
}

/** [lo, hi)에서 a[key] 이상인 첫 위치 (key는 구간 밖) */
export function lowerBound(t: Tracer, lo: number, hi: number, key: number, line = 0) {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (t.cmp(mid, key, line) < 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** [lo, hi)에서 a[key]보다 큰 첫 위치 (key는 구간 밖) */
export function upperBound(t: Tracer, lo: number, hi: number, key: number, line = 0) {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (t.cmp(mid, key, line) <= 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * 보조 메모리 없이 정렬된 [lo, mid)와 [mid, hi)를 병합한다 (안정).
 * 긴 쪽의 가운데를 기준으로 짧은 쪽을 이진 탐색해 두 조각을 회전하고, 양쪽을 재귀 병합.
 */
export function rotationMerge(
  t: Tracer,
  lo: number,
  mid: number,
  hi: number,
  lines: RotationLines = NO_ROTATION_LINES
) {
  const len1 = mid - lo;
  const len2 = hi - mid;
  if (len1 === 0 || len2 === 0) return;
  if (len1 + len2 === 2) {
    if (t.cmp(mid, lo, lines.cmpPair) < 0) t.swap(lo, mid, lines.swapPair);
    return;
  }
  let cut1: number;
  let cut2: number;
  if (len1 > len2) {
    cut1 = lo + (len1 >> 1);
    cut2 = lowerBound(t, mid, hi, cut1, lines.cmpLower);
  } else {
    cut2 = mid + (len2 >> 1);
    cut1 = upperBound(t, lo, mid, cut2, lines.cmpUpper);
  }
  rotate(t, cut1, mid, cut2, lines.swapReverse);
  const newMid = cut1 + (cut2 - mid);
  rotationMerge(t, lo, cut1, newMid, lines);
  rotationMerge(t, newMid, cut2, hi, lines);
}
