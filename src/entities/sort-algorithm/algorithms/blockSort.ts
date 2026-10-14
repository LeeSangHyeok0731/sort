import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { insertionSortRange } from "./insertionSort";
import { lowerBound, rotate, rotationMerge } from "./rotation";
import { ALGO_CODE } from "./code";

const CHUNK = 16;

/**
 * 정렬된 A=[lo, mid)와 B=[mid, hi)를 블록 단위로 병합한다.
 * A를 √|A| 크기 블록으로 나누고, 블록마다:
 *  1) B에서 이 블록의 첫 값보다 작은 값들을 찾아 남은 A 블록들 앞으로 회전시키고 (블록 굴리기)
 *  2) 직전에 내려놓은 A 블록과 그 사이 B 값들을 국소 병합한다.
 */
function blockMerge(t: Tracer, lo: number, mid: number, hi: number) {
  const lenA = mid - lo;
  const blockSize = Math.max(1, Math.floor(Math.sqrt(lenA)));
  // 첫 블록이 나머지 크기를 가져가 이후 블록들은 모두 blockSize
  const firstSize = lenA % blockSize || blockSize;

  let aStart = lo; // 아직 내려놓지 않은 A 블록들의 시작
  let bStart = mid; // 남은 B의 시작
  let lastA: [number, number] | null = null; // 직전에 내려놓은 A 블록

  for (let size = firstSize; aStart < bStart; size = blockSize) {
    // B에서 현재 A 블록의 첫 값보다 작은 값들 [bStart, p)
    const p = lowerBound(t, bStart, hi, aStart);
    const taken = p - bStart;
    rotate(t, aStart, bStart, p);
    if (lastA) rotationMerge(t, lastA[0], lastA[1], aStart + taken);
    lastA = [aStart + taken, aStart + taken + size];
    aStart = lastA[1];
    bStart = p;
  }
  if (lastA) rotationMerge(t, lastA[0], lastA[1], hi);
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
  code: ALGO_CODE.block,
  sort(t) {
    const n = t.length;
    for (let i = 0; i < n; i += CHUNK) insertionSortRange(t, i, Math.min(i + CHUNK, n) - 1);
    for (let width = CHUNK; width < n; width *= 2) {
      for (let lo = 0; lo + width < n; lo += 2 * width) {
        const mid = lo + width;
        const hi = Math.min(lo + 2 * width, n);
        // 이미 순서가 맞으면 건너뛰고, A 전체가 B 전체보다 크면 통째로 회전
        if (t.cmp(mid - 1, mid) <= 0) continue;
        if (t.cmp(lo, hi - 1) > 0) rotate(t, lo, mid, hi);
        else blockMerge(t, lo, mid, hi);
      }
    }
  },
};
