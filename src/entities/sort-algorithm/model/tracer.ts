import type { ArrayItem } from "@/shared/model";
import { applyOp, OP_STRIDE, OpType } from "./op";

/**
 * 한 번의 정렬에서 기록할 수 있는 최대 연산 수.
 * 스투지·슬로우 정렬처럼 연산이 폭발하는 알고리즘이 브라우저를 멈추지 않게 한다.
 * (1000개 버블 정렬이 약 75만 연산이므로 일반 알고리즘은 닿지 않는다)
 */
export const MAX_OPS = 3_000_000;

/** 연산 한도를 넘었을 때 정렬을 중단시키는 신호 */
export class OpBudgetExceeded extends Error {
  constructor() {
    super("정렬 연산 한도를 초과했습니다.");
    this.name = "OpBudgetExceeded";
  }
}

/**
 * 알고리즘이 배열을 다루는 유일한 통로.
 * 모든 비교·변경을 연산 로그에 기록하면서 작업 배열에 반영한다.
 */
export class Tracer {
  /** 기록 중인 연산 (정렬이 끝나면 runSort가 Int32Array로 압축한다) */
  readonly ops: number[] = [];
  private readonly a: ArrayItem[];

  constructor(
    initial: readonly ArrayItem[],
    private readonly maxOps: number = MAX_OPS
  ) {
    this.a = [...initial];
  }

  /** 연산을 기록한다. 한도를 넘으면 배열을 바꾸기 전에 중단한다. */
  private record(type: OpType, a: number, b: number) {
    if (this.ops.length >= this.maxOps * OP_STRIDE) throw new OpBudgetExceeded();
    this.ops.push(type, a, b);
  }

  get length() {
    return this.a.length;
  }

  /** 기록 없이 값을 읽는다 (알고리즘 내부 계산용). */
  value(i: number): number {
    return this.a[i].value;
  }

  /** 기록 없이 요소를 읽는다. */
  item(i: number): ArrayItem {
    return this.a[i];
  }

  /** a[i] - a[j] 를 반환하며 비교를 기록한다. */
  cmp(i: number, j: number): number {
    this.record(OpType.Compare, i, j);
    return this.a[i].value - this.a[j].value;
  }

  swap(i: number, j: number) {
    if (i === j) return;
    this.record(OpType.Swap, i, j);
    applyOp(this.a, OpType.Swap, i, j);
  }

  /** from 위치의 요소를 to 위치로 옮긴다. */
  move(from: number, to: number) {
    if (from === to) return;
    this.record(OpType.Move, from, to);
    applyOp(this.a, OpType.Move, from, to);
  }

  /** 값 읽기를 기록한다 (하이라이트용). */
  mark(i: number) {
    this.record(OpType.Mark, i, i);
  }

  /**
   * 요소들을 target 순서(id 기준)대로 [start, start + target.length) 구간에 배치한다.
   * 앞에서부터 move로 끌어오므로 아직 배치되지 않은 요소들의 상대 순서가 유지된다.
   */
  arrange(start: number, target: readonly ArrayItem[]) {
    for (let k = 0; k < target.length; k++) {
      const dest = start + k;
      let from = dest;
      while (this.a[from].id !== target[k].id) from++;
      this.move(from, dest);
    }
  }

  snapshot(): ArrayItem[] {
    return [...this.a];
  }
}
