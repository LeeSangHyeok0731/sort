import type { ArrayItem } from "@/shared/model";
import type { BarHighlight } from "@/entities/array";
import { applyOp, opCount, OpType, OP_STRIDE, revertOp, type SortResult } from "@/entities/sort-algorithm";

export type TrackStats = {
  compares: number;
  swaps: number;
  moves: number;
  reads: number;
};

const emptyStats = (): TrackStats => ({ compares: 0, swaps: 0, moves: 0, reads: 0 });

const STAT_KEY: Record<number, keyof TrackStats> = {
  [OpType.Compare]: "compares",
  [OpType.Swap]: "swaps",
  [OpType.Move]: "moves",
  [OpType.Mark]: "reads",
};

/**
 * 연산 로그 하나를 앞뒤로 재생하는 커서.
 * cursor = 지금까지 적용된 연산 수 (0 ~ total).
 */
export class Track {
  readonly total: number;
  readonly truncated: boolean;
  readonly array: ArrayItem[];
  readonly stats: TrackStats = emptyStats();
  /** 설명 코드 줄별 실행 횟수 (인덱스 = 줄 번호, 줄 정보 없는 연산은 세지 않음) */
  readonly lineHits: number[] = [];
  private readonly ops: ArrayLike<number>;
  private _cursor = 0;

  constructor(initial: readonly ArrayItem[], result: Pick<SortResult, "ops" | "truncated">) {
    this.array = [...initial];
    this.ops = result.ops;
    this.total = opCount(result.ops);
    this.truncated = result.truncated;
  }

  get cursor() {
    return this._cursor;
  }

  get done() {
    return this._cursor >= this.total;
  }

  forward(): boolean {
    if (this.done) return false;
    const base = this._cursor * OP_STRIDE;
    const type = this.ops[base];
    applyOp(this.array, type as OpType, this.ops[base + 1], this.ops[base + 2]);
    this.stats[STAT_KEY[type]]++;
    const line = this.ops[base + 3];
    if (line > 0) this.lineHits[line] = (this.lineHits[line] ?? 0) + 1;
    this._cursor++;
    return true;
  }

  backward(): boolean {
    if (this._cursor === 0) return false;
    this._cursor--;
    const base = this._cursor * OP_STRIDE;
    const type = this.ops[base];
    revertOp(this.array, type as OpType, this.ops[base + 1], this.ops[base + 2]);
    this.stats[STAT_KEY[type]]--;
    const line = this.ops[base + 3];
    if (line > 0) this.lineHits[line]--;
    return true;
  }

  /** 마지막으로 적용된 연산을 만든 설명 코드 줄 (없으면 0) */
  get line(): number {
    if (this._cursor === 0) return 0;
    return this.ops[(this._cursor - 1) * OP_STRIDE + 3];
  }

  /** target 위치로 이동한다 (범위를 벗어나면 끝으로 보정). */
  seek(target: number) {
    const to = Math.max(0, Math.min(this.total, Math.floor(target)));
    while (this._cursor < to) this.forward();
    while (this._cursor > to) this.backward();
  }

  /** 마지막으로 적용된 연산을 하이라이트로 변환한다. */
  highlight(): BarHighlight {
    if (this._cursor === 0) return null;
    const base = (this._cursor - 1) * OP_STRIDE;
    const type = this.ops[base];
    const a = this.ops[base + 1];
    const b = this.ops[base + 2];
    switch (type) {
      case OpType.Compare:
        return { tone: "compare", indices: [a, b] };
      case OpType.Mark:
        return { tone: "read", indices: [a] };
      case OpType.Move:
        // 옮겨진 요소의 새 위치만 강조
        return { tone: "change", indices: [b] };
      default:
        return { tone: "change", indices: [a, b] };
    }
  }
}
