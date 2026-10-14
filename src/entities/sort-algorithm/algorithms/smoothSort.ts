import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { ALGO_CODE } from "./code";

/** 레오나르도 수: L(0)=L(1)=1, L(k)=L(k-1)+L(k-2)+1 */
const LP: number[] = [1, 1];
while (LP.length < 46) LP.push(LP[LP.length - 1] + LP[LP.length - 2] + 1);

/** 최하위 0 비트 개수 */
function trailingZeros(x: number) {
  return 31 - Math.clz32(x & -x);
}

/**
 * Dijkstra의 스무스 정렬 (레오나르도 힙 숲).
 * p: 숲에 있는 힙 차수들의 비트 집합(pshift 기준), pshift: 가장 작은 힙의 차수.
 */
class Smooth {
  constructor(private readonly t: Tracer) {}

  /** 차수 pshift인 힙의 루트 head를 아래로 내린다 */
  sift(pshift: number, head: number) {
    const { t } = this;
    while (pshift > 1) {
      const rt = head - 1;
      const lf = head - 1 - LP[pshift - 2];
      if (t.cmp(head, lf) >= 0 && t.cmp(head, rt) >= 0) break;
      if (t.cmp(lf, rt) >= 0) {
        t.swap(head, lf);
        head = lf;
        pshift -= 1;
      } else {
        t.swap(head, rt);
        head = rt;
        pshift -= 2;
      }
    }
  }

  /** 루트들이 왼쪽부터 오름차순이 되도록 head를 이전 힙 루트들과 교환해 나간다 */
  trinkle(p: number, pshift: number, head: number, trusty: boolean) {
    const { t } = this;
    while (p !== 1) {
      const stepson = head - LP[pshift];
      if (t.cmp(stepson, head) <= 0) break;
      if (!trusty && pshift > 1) {
        const rt = head - 1;
        const lf = head - 1 - LP[pshift - 2];
        if (t.cmp(rt, stepson) >= 0 || t.cmp(lf, stepson) >= 0) break;
      }
      t.swap(head, stepson);
      head = stepson;
      const trail = trailingZeros(p & ~1);
      p >>>= trail;
      pshift += trail;
      trusty = false;
    }
    if (!trusty) this.sift(pshift, head);
  }

  run() {
    const n = this.t.length;
    if (n < 2) return;
    let p = 1;
    let pshift = 1;
    let head = 0;

    // 1단계: 원소를 하나씩 추가하며 레오나르도 힙 숲을 만든다
    while (head < n - 1) {
      if ((p & 3) === 3) {
        this.sift(pshift, head);
        p >>>= 2;
        pshift += 2;
      } else {
        if (LP[pshift - 1] >= n - 1 - head) this.trinkle(p, pshift, head, false);
        else this.sift(pshift, head);
        if (pshift === 1) {
          p <<= 1;
          pshift--;
        } else {
          p <<= pshift - 1;
          pshift = 1;
        }
      }
      p |= 1;
      head++;
    }
    this.trinkle(p, pshift, head, false);

    // 2단계: 가장 오른쪽 루트(최댓값)를 떼어 내며 힙을 쪼갠다
    while (pshift !== 1 || p !== 1) {
      if (pshift <= 1) {
        const trail = trailingZeros(p & ~1);
        p >>>= trail;
        pshift += trail;
      } else {
        p <<= 2;
        p ^= 7;
        pshift -= 2;
        this.trinkle(p >>> 1, pshift + 1, head - LP[pshift] - 1, true);
        this.trinkle(p, pshift, head - 1, true);
      }
      head--;
    }
  }
}

export const smoothSort: SortAlgorithm = {
  id: "smooth",
  name: "스무스 정렬",
  category: "special",
  desc: "레오나르도 힙을 쓰는 적응형 힙 정렬",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
  },
  stable: false,
  code: ALGO_CODE.smooth,
  sort(t) {
    new Smooth(t).run();
  },
};
