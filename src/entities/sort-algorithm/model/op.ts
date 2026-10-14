import type { ArrayItem } from "@/shared/model";

/**
 * 정렬 과정은 배열 스냅샷이 아니라 연산 로그로 기록한다.
 * 로그는 [type, a, b, type, a, b, ...] 형태의 평탄한 number 배열이다.
 */
export const OpType = {
  /** a, b 위치의 값을 비교 (배열 변화 없음) */
  Compare: 0,
  /** a, b 위치의 요소를 맞바꿈 */
  Swap: 1,
  /** a 위치의 요소를 꺼내 b 위치에 삽입 (사이 요소는 한 칸씩 밀림) */
  Move: 2,
  /** a 위치의 값을 읽음 (배열 변화 없음, 비교로 집계하지 않음) */
  Mark: 3,
} as const;

export type OpType = (typeof OpType)[keyof typeof OpType];

export const OP_STRIDE = 3;

/** 기록이 끝난 연산 로그 (Int32Array로 압축) — 읽기 전용으로 다룬다 */
export type OpLog = ArrayLike<number>;

export type Op = { type: OpType; a: number; b: number };

export function opCount(log: OpLog): number {
  return log.length / OP_STRIDE;
}

export function readOp(log: OpLog, index: number): Op {
  const base = index * OP_STRIDE;
  return { type: log[base] as OpType, a: log[base + 1], b: log[base + 2] };
}

function moveItem(arr: ArrayItem[], from: number, to: number) {
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
}

/** 연산을 배열에 적용한다 (제자리 변경). */
export function applyOp(arr: ArrayItem[], type: OpType, a: number, b: number) {
  if (type === OpType.Swap) {
    const tmp = arr[a];
    arr[a] = arr[b];
    arr[b] = tmp;
  } else if (type === OpType.Move) {
    moveItem(arr, a, b);
  }
}

/** applyOp의 역연산. */
export function revertOp(arr: ArrayItem[], type: OpType, a: number, b: number) {
  if (type === OpType.Move) {
    moveItem(arr, b, a);
  } else {
    applyOp(arr, type, a, b);
  }
}
