import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { OP_STRIDE, OpType } from "../model/op";

const CODE = defineCode(`// David Morgan-Mar의 보고보고 정렬
// 원래는 원본을 복사해 복사본을 정렬해 보는데, 여기서는 배열 자체를 복사본처럼 쓰고
// 기록해 둔 교환을 거꾸로 되돌려 원본으로 돌아온다 (그 과정도 화면에 보인다)
function bogobogoSort(arr) {
  bogobogo(arr, arr.length);
  return arr;
}

const log = []; // 지금까지 한 모든 교환

function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
  log.push([i, j]);
}

// 앞 n개를 정렬한다
function bogobogo(arr, n) {
  if (n <= 1) return;
  for (;;) {
    const copyStart = log.length; // 1) "복사본"을 만든 시점
    // 2~3) 복사본의 앞 n-1개를 보고보고 정렬하고,
    //      마지막 원소가 그 최댓값 이상일 때까지 복사본을 섞으며 반복
    for (;;) {
      bogobogo(arr, n - 1);
      if (arr[n - 2] <= arr[n - 1]) break; //@cmp
      shuffle(arr, n);
    }
    // 4) 복사본을 정렬하는 동안 교환이 없었다 = 원본이 이미 정렬돼 있었다
    if (log.length === copyStart) return;
    // 아니면 복사본을 버리고(교환을 거꾸로 되돌려 원본으로) 원본을 섞고 처음부터
    for (const [i, j] of log.slice(copyStart).reverse()) swap(arr, i, j);
    shuffle(arr, n);
  }
}

function shuffle(arr, n) {
  for (let i = n - 1; i > 0; i--) swap(arr, i, Math.floor(Math.random() * (i + 1)));
}`);

const L = { swap: CODE.line("swap"), cmp: CODE.line("cmp") };

function shuffle(t: Tracer, n: number) {
  for (let i = n - 1; i > 0; i--) t.swap(i, Math.floor(Math.random() * (i + 1)), L.swap);
}

/** from 이후에 기록된 교환을 거꾸로 다시 적용해 그 시점의 배열로 되돌린다 */
function undoSwapsSince(t: Tracer, from: number) {
  const swaps: Array<[number, number]> = [];
  const ops = t.ops;
  for (let k = from; k < ops.length; k += OP_STRIDE) {
    if (ops[k] === OpType.Swap) swaps.push([ops[k + 1], ops[k + 2]]);
  }
  for (let k = swaps.length - 1; k >= 0; k--) t.swap(swaps[k][0], swaps[k][1], L.swap);
}

function hasSwapSince(t: Tracer, from: number) {
  const ops = t.ops;
  for (let k = from; k < ops.length; k += OP_STRIDE) {
    if (ops[k] === OpType.Swap) return true;
  }
  return false;
}

/**
 * David Morgan-Mar의 보고보고 정렬로 앞 n개를 정렬한다.
 * 1) 원본을 복사한다 (여기선 배열 자체를 복사본처럼 쓰고, 나중에 되돌린다)
 * 2) 복사본의 앞 n-1개를 보고보고 정렬한다 (재귀)
 * 3) n번째가 앞의 최댓값 이상이면 복사본 정렬 완료, 아니면 복사본을 섞고 2)로
 * 4) 정렬된 복사본이 원본과 같은 순서면 끝. 아니면 원본을 섞고 1)로
 */
function bogobogo(t: Tracer, n: number) {
  if (n <= 1) return;
  for (;;) {
    const copyStart = t.ops.length;
    for (;;) {
      bogobogo(t, n - 1);
      if (t.cmp(n - 2, n - 1, L.cmp) <= 0) break;
      shuffle(t, n);
    }
    if (!hasSwapSince(t, copyStart)) return;
    undoSwapsSince(t, copyStart);
    shuffle(t, n);
  }
}

export const bogobogoSort: SortAlgorithm = {
  id: "bogobogo",
  name: "보고보고 정렬",
  category: "fun",
  desc: "복사본을 재귀로 정렬해 원본이 정렬됐는지 확인",
  complexity: { best: "O(n²)", average: "O(n!^n)", worst: "∞", space: "O(n)" },
  stable: false,
  note: "복사본을 정렬했다가 되돌리는 과정까지 화면에 보여요. 원소가 4개까지는 끝나지만, 5개만 돼도 거의 항상 연산 한도(300만)에 걸려 미완료로 끝납니다.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    bogobogo(t, t.length);
  },
};
