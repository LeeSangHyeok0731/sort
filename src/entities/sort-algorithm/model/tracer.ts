import type { ArrayItem } from "@/shared/model";
import { applyOp, OpType, type OpLog } from "./op";

/**
 * 알고리즘이 배열을 다루는 유일한 통로.
 * 모든 비교·변경을 연산 로그에 기록하면서 작업 배열에 반영한다.
 */
export class Tracer {
  readonly ops: OpLog = [];
  private readonly a: ArrayItem[];

  constructor(initial: readonly ArrayItem[]) {
    this.a = [...initial];
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
    this.ops.push(OpType.Compare, i, j);
    return this.a[i].value - this.a[j].value;
  }

  swap(i: number, j: number) {
    if (i === j) return;
    this.ops.push(OpType.Swap, i, j);
    applyOp(this.a, OpType.Swap, i, j);
  }

  /** from 위치의 요소를 to 위치로 옮긴다. */
  move(from: number, to: number) {
    if (from === to) return;
    this.ops.push(OpType.Move, from, to);
    applyOp(this.a, OpType.Move, from, to);
  }

  /** 값 읽기를 기록한다 (하이라이트용). */
  mark(i: number) {
    this.ops.push(OpType.Mark, i, i);
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
