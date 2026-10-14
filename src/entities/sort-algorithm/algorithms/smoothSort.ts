import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

/** 레오나르도 수: L(0)=L(1)=1, L(k)=L(k-1)+L(k-2)+1 */
const LP: number[] = [1, 1];
while (LP.length < 46) LP.push(LP[LP.length - 1] + LP[LP.length - 2] + 1);

/** 최하위 0 비트 개수 */
function trailingZeros(x: number) {
  return 31 - Math.clz32(x & -x);
}

const CODE = defineCode(`// Dijkstra의 스무스 정렬
// 배열을 "레오나르도 힙"들의 숲(forest)으로 관리하는 적응형 힙 정렬.
// 이미 거의 정렬된 배열이면 O(n)에 가깝게 끝난다.

// 레오나르도 수: L(0) = L(1) = 1, L(k) = L(k-1) + L(k-2) + 1 → 1, 1, 3, 5, 9, 15, 25, ...
// 차수 k인 레오나르도 힙의 크기는 L(k): [왼쪽 자식 힙(k-1)] [오른쪽 자식 힙(k-2)] [루트]
const L = [1, 1];
while (L.length < 46) L.push(L[L.length - 1] + L[L.length - 2] + 1);

// 최하위 0 비트 개수 (예: 0b1000 → 3)
function trailingZeros(x) {
  return 31 - Math.clz32(x & -x);
}

// 숲의 상태: p = 힙 차수들의 비트 집합(최하위 비트 = 가장 오른쪽 힙),
//            pshift = 가장 오른쪽(가장 작은) 힙의 차수

// 차수 order인 힙의 루트 head를 자식들보다 작지 않을 때까지 아래로 내린다
function sift(arr, order, head) {
  while (order > 1) {
    const right = head - 1; // 오른쪽 자식 힙의 루트
    const left = head - 1 - L[order - 2]; // 왼쪽 자식 힙의 루트
    if (arr[head] >= arr[left] && arr[head] >= arr[right]) break; //@cmp-root
    if (arr[left] >= arr[right]) { //@cmp-children
      [arr[head], arr[left]] = [arr[left], arr[head]]; //@swap-left
      head = left;
      order -= 1;
    } else {
      [arr[head], arr[right]] = [arr[right], arr[head]]; //@swap-right
      head = right;
      order -= 2;
    }
  }
}

// 숲의 루트들이 왼쪽부터 오름차순이 되도록,
// head를 왼쪽 이웃 힙의 루트(stepson)와 바꿔 가며 왼쪽으로 보낸 뒤 sift 한다
// trusty: head의 힙이 이미 힙 조건을 만족하는지 (true면 자식 비교를 생략)
function trinkle(arr, p, pshift, head, trusty) {
  while (p !== 1) {
    const stepson = head - L[pshift]; // 왼쪽 이웃 힙의 루트
    if (arr[stepson] <= arr[head]) break; //@cmp-stepson
    if (!trusty && pshift > 1) {
      // 내 자식이 stepson보다 크면, 나를 보내는 대신 sift로 해결된다
      const right = head - 1;
      const left = head - 1 - L[pshift - 2];
      if (arr[right] >= arr[stepson] || arr[left] >= arr[stepson]) break; //@cmp-stepson-children
    }
    [arr[head], arr[stepson]] = [arr[stepson], arr[head]]; //@swap-stepson
    head = stepson;
    // 왼쪽 이웃 힙으로 넘어간다: 다음으로 켜진 비트까지 이동
    const trail = trailingZeros(p & ~1);
    p >>>= trail;
    pshift += trail;
    trusty = false;
  }
  if (!trusty) sift(arr, pshift, head);
}

function smoothSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;

  let p = 1; // 처음 숲: 원소 0 하나짜리 힙(차수 1)
  let pshift = 1;
  let head = 0;

  // ── 1단계: 원소를 하나씩 오른쪽에 붙이며 숲을 만든다 ──
  while (head < n - 1) {
    if ((p & 3) === 3) {
      // 가장 오른쪽 두 힙의 차수가 연속(k+1, k)이면 새 원소를 루트로 차수 k+2 힙 하나로 합친다
      sift(arr, pshift, head);
      p >>>= 2;
      pshift += 2;
    } else {
      // 아니면 새 원소 하나로 크기 1짜리 힙을 만든다.
      // 이 힙이 끝까지 더 커지지 않을 것이면 루트 순서를 맞추고(trinkle), 아니면 힙 안에서만 정리(sift)
      if (L[pshift - 1] >= n - 1 - head) trinkle(arr, p, pshift, head, false);
      else sift(arr, pshift, head);

      if (pshift === 1) {
        p <<= 1; // 차수 1 다음에는 차수 0 힙을 붙인다 (둘 다 크기 1)
        pshift--;
      } else {
        p <<= pshift - 1;
        pshift = 1;
      }
    }
    p |= 1;
    head++;
  }
  trinkle(arr, p, pshift, head, false);

  // ── 2단계: 가장 오른쪽 루트(= 전체 최댓값)는 이미 제자리 ──
  // 그 힙을 떼어 내고, 남은 두 자식 힙의 루트 순서를 다시 맞춘다
  while (pshift !== 1 || p !== 1) {
    if (pshift <= 1) {
      // 크기 1짜리 힙은 그냥 떼어 낸다
      const trail = trailingZeros(p & ~1);
      p >>>= trail;
      pshift += trail;
    } else {
      // 차수 k 힙을 루트 + 차수 k-1, k-2 두 자식 힙으로 쪼갠다
      p <<= 2;
      p ^= 7;
      pshift -= 2;
      trinkle(arr, p >>> 1, pshift + 1, head - L[pshift] - 1, true);
      trinkle(arr, p, pshift, head - 1, true);
    }
    head--;
  }
  return arr;
}`);

const LINE = {
  cmpRoot: CODE.line("cmp-root"),
  cmpChildren: CODE.line("cmp-children"),
  swapLeft: CODE.line("swap-left"),
  swapRight: CODE.line("swap-right"),
  cmpStepson: CODE.line("cmp-stepson"),
  cmpStepsonChildren: CODE.line("cmp-stepson-children"),
  swapStepson: CODE.line("swap-stepson"),
};

/**
 * Dijkstra의 스무스 정렬 (레오나르도 힙 숲).
 * p: 숲에 있는 힙 차수들의 비트 집합(pshift 기준), pshift: 가장 작은 힙의 차수.
 */
class Smooth {
  constructor(private readonly t: Tracer) {}

  sift(pshift: number, head: number) {
    const { t } = this;
    while (pshift > 1) {
      const rt = head - 1;
      const lf = head - 1 - LP[pshift - 2];
      if (t.cmp(head, lf, LINE.cmpRoot) >= 0 && t.cmp(head, rt, LINE.cmpRoot) >= 0) break;
      if (t.cmp(lf, rt, LINE.cmpChildren) >= 0) {
        t.swap(head, lf, LINE.swapLeft);
        head = lf;
        pshift -= 1;
      } else {
        t.swap(head, rt, LINE.swapRight);
        head = rt;
        pshift -= 2;
      }
    }
  }

  trinkle(p: number, pshift: number, head: number, trusty: boolean) {
    const { t } = this;
    while (p !== 1) {
      const stepson = head - LP[pshift];
      if (t.cmp(stepson, head, LINE.cmpStepson) <= 0) break;
      if (!trusty && pshift > 1) {
        const rt = head - 1;
        const lf = head - 1 - LP[pshift - 2];
        if (t.cmp(rt, stepson, LINE.cmpStepsonChildren) >= 0 || t.cmp(lf, stepson, LINE.cmpStepsonChildren) >= 0) {
          break;
        }
      }
      t.swap(head, stepson, LINE.swapStepson);
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
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    new Smooth(t).run();
  },
};
