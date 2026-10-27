import type { ArrayItem } from "@/shared/model";
import { applyOp, OP_STRIDE, OpType } from "./op";

/**
 * 한 번의 정렬에서 기록할 수 있는 최대 연산 수.
 * 스투지·슬로우 정렬처럼 연산이 폭발하는 알고리즘이 브라우저를 멈추지 않게 한다.
 * (1000개 버블 정렬이 약 75만 연산이므로 일반 알고리즘은 닿지 않는다)
 */
export const MAX_OPS = 3_000_000;

/** 처음 잡아 두는 연산 수 (작은 정렬은 늘리지 않고 끝난다) */
const INITIAL_CAPACITY = 1024;

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
  /**
   * 기록 중인 연산. 처음부터 Int32Array에 쓰고, 꽉 차면 2배로 늘린다.
   * (일반 배열에 쌓았다가 마지막에 옮기면 원소당 8바이트에 증가 여유분, 옮길 때 사본까지 겹쳐
   *  기록 중 최대 메모리가 결과의 약 7배까지 올라갔다)
   */
  private buf = new Int32Array(INITIAL_CAPACITY * OP_STRIDE);
  private size = 0;
  private readonly a: ArrayItem[];

  constructor(
    initial: readonly ArrayItem[],
    private readonly maxOps: number = MAX_OPS
  ) {
    this.a = [...initial];
  }

  /** 지금까지 기록된 연산 (버퍼를 공유하는 뷰라 이후 기록이 늘면 다시 읽어야 한다) */
  get ops(): Int32Array {
    return this.buf.subarray(0, this.size);
  }

  /** 기록을 끝내고 정확한 길이의 연산 로그를 돌려준다. */
  finish(): Int32Array {
    return this.size === this.buf.length ? this.buf : this.buf.slice(0, this.size);
  }

  /** 연산을 기록한다. 한도를 넘으면 배열을 바꾸기 전에 중단한다. */
  private record(type: OpType, a: number, b: number, line: number) {
    const limit = this.maxOps * OP_STRIDE;
    if (this.size >= limit) throw new OpBudgetExceeded();
    if (this.size === this.buf.length) {
      const grown = new Int32Array(Math.min(limit, this.buf.length * 2));
      grown.set(this.buf);
      this.buf = grown;
    }
    const buf = this.buf;
    buf[this.size] = type;
    buf[this.size + 1] = a;
    buf[this.size + 2] = b;
    buf[this.size + 3] = line;
    this.size += OP_STRIDE;
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

  /** a[i] - a[j] 를 반환하며 비교를 기록한다. line: 설명 코드의 줄 번호 (선택) */
  cmp(i: number, j: number, line = 0): number {
    this.record(OpType.Compare, i, j, line);
    return this.a[i].value - this.a[j].value;
  }

  swap(i: number, j: number, line = 0) {
    if (i === j) return;
    this.record(OpType.Swap, i, j, line);
    applyOp(this.a, OpType.Swap, i, j);
  }

  /** from 위치의 요소를 to 위치로 옮긴다. */
  move(from: number, to: number, line = 0) {
    if (from === to) return;
    this.record(OpType.Move, from, to, line);
    applyOp(this.a, OpType.Move, from, to);
  }

  /** 값 읽기를 기록한다 (하이라이트용). */
  mark(i: number, line = 0) {
    this.record(OpType.Mark, i, i, line);
  }

  /**
   * 요소들을 target 순서(id 기준)대로 [start, start + target.length) 구간에 배치한다.
   * 앞에서부터 move로 끌어오므로 아직 배치되지 않은 요소들의 상대 순서가 유지된다.
   */
  arrange(start: number, target: readonly ArrayItem[], line = 0) {
    for (let k = 0; k < target.length; k++) {
      const dest = start + k;
      let from = dest;
      while (this.a[from].id !== target[k].id) from++;
      this.move(from, dest, line);
    }
  }

  snapshot(): ArrayItem[] {
    return [...this.a];
  }
}
