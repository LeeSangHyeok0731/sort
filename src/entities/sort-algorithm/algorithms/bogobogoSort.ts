import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";
import { OP_STRIDE, OpType } from "../model/op";
import { ALGO_CODE } from "./code";

function shuffle(t: Tracer, n: number) {
  for (let i = n - 1; i > 0; i--) t.swap(i, Math.floor(Math.random() * (i + 1)));
}

/** from 이후에 기록된 교환을 거꾸로 다시 적용해 그 시점의 배열로 되돌린다 */
function undoSwapsSince(t: Tracer, from: number) {
  const swaps: Array<[number, number]> = [];
  for (let k = from; k < t.ops.length; k += OP_STRIDE) {
    if (t.ops[k] === OpType.Swap) swaps.push([t.ops[k + 1], t.ops[k + 2]]);
  }
  for (let k = swaps.length - 1; k >= 0; k--) t.swap(swaps[k][0], swaps[k][1]);
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
      if (t.cmp(n - 2, n - 1) <= 0) break;
      shuffle(t, n);
    }
    const unchanged = !hasSwapSince(t, copyStart);
    if (unchanged) return; // 원본이 이미 정렬돼 있었다
    undoSwapsSince(t, copyStart); // 복사본을 버리고 원본으로
    shuffle(t, n);
  }
}

function hasSwapSince(t: Tracer, from: number) {
  for (let k = from; k < t.ops.length; k += OP_STRIDE) {
    if (t.ops[k] === OpType.Swap) return true;
  }
  return false;
}

export const bogobogoSort: SortAlgorithm = {
  id: "bogobogo",
  name: "보고보고 정렬",
  category: "fun",
  desc: "복사본을 재귀로 정렬해 원본이 정렬됐는지 확인",
  complexity: { best: "O(n²)", average: "O(n!^n)", worst: "∞", space: "O(n)" },
  stable: false,
  note: "복사본을 정렬했다가 되돌리는 과정까지 화면에 보여요. 원소가 4개까지는 끝나지만, 5개만 돼도 거의 항상 연산 한도(300만)에 걸려 미완료로 끝납니다.",
  code: ALGO_CODE.bogobogo,
  sort(t) {
    bogobogo(t, t.length);
  },
};
