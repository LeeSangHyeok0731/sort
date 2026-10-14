import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { insertionSortRange } from "./insertionSort";
import { lowerBound, rotationMerge } from "./rotation";
import { ALGO_CODE } from "./code";

/**
 * 1) 키 모으기: 서로 다른 값의 "첫 등장"을 앞쪽 [0, keys)로 모은다 (정렬된 상태로 유지).
 *    이 키들은 병합할 때 내부 버퍼(교환용 빈자리)로 쓴다.
 */
function collectKeys(t: Tracer, wanted: number) {
  let keys = 1;
  for (let i = 1; i < t.length && keys < wanted; i++) {
    const pos = lowerBound(t, 0, keys, i);
    if (pos < keys && t.cmp(pos, i) === 0) continue; // 이미 같은 값의 키가 있다
    t.move(i, pos); // 사이의 원소들은 한 칸씩 밀릴 뿐 순서 유지
    keys++;
  }
  return keys;
}

/**
 * 버퍼를 이용한 병합: A=[lo, mid)를 버퍼 [0, |A|)와 맞바꾼 뒤,
 * 버퍼 쪽 A와 B=[mid, hi)를 비교하며 결과 자리와 교환해 채운다.
 * 버퍼 값(키)은 순서만 섞인 채 다시 버퍼 자리로 돌아온다.
 */
function bufferedMerge(t: Tracer, lo: number, mid: number, hi: number) {
  const lenA = mid - lo;
  for (let k = 0; k < lenA; k++) t.swap(k, lo + k);
  let i = 0; // 버퍼 안의 A
  let j = mid; // B
  let out = lo;
  while (i < lenA && j < hi) {
    // 같으면 A 먼저 → 안정
    if (t.cmp(j, i) < 0) t.swap(out++, j++);
    else t.swap(out++, i++);
  }
  while (i < lenA) t.swap(out++, i++);
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
  code: ALGO_CODE.grail,
  sort(t) {
    const n = t.length;
    if (n < 2) return;
    const keys = collectKeys(t, Math.max(1, Math.floor(Math.sqrt(n))));

    // 나머지 [keys, n)를 상향식 병합: 왼쪽 런이 버퍼에 들어가면 버퍼 병합, 아니면 회전 병합
    for (let width = 1; keys + width < n; width *= 2) {
      for (let lo = keys; lo + width < n; lo += 2 * width) {
        const mid = lo + width;
        const hi = Math.min(lo + 2 * width, n);
        if (t.cmp(mid - 1, mid) <= 0) continue;
        if (width <= keys) bufferedMerge(t, lo, mid, hi);
        else rotationMerge(t, lo, mid, hi);
      }
    }

    // 섞인 키(버퍼)를 정렬하고 나머지와 병합. 키는 각 값의 첫 등장이므로 앞에 오는 것이 안정
    insertionSortRange(t, 0, keys - 1);
    rotationMerge(t, 0, keys, n);
  },
};
