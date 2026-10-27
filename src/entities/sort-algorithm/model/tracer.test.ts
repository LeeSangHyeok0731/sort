import { describe, expect, it } from "vitest";
import type { ArrayItem } from "@/shared/model";
import { applyOp, opCount, readOp } from "./op";
import { runSort } from "./run";
import type { SortAlgorithm } from "./types";

const input: ArrayItem[] = [5, 4, 3, 2, 1, 0].map((value, id) => ({ id, value }));

/** 끝없이 비교·교환만 반복하는 가짜 알고리즘 */
const endless: Pick<SortAlgorithm, "sort"> = {
  sort(t) {
    for (;;) {
      t.cmp(0, 1);
      t.swap(0, 1);
    }
  },
};

describe("연산 한도", () => {
  it("한도를 넘으면 중단하고 truncated로 표시한다", () => {
    const result = runSort(endless, input, {}, { maxOps: 101 });
    expect(result.truncated).toBe(true);
    expect(opCount(result.ops)).toBe(101);
  });

  it("중단된 시점의 배열은 기록된 연산을 재생한 결과와 같다", () => {
    const result = runSort(endless, input, {}, { maxOps: 101 });
    const replay = [...input];
    for (let k = 0; k < opCount(result.ops); k++) {
      const op = readOp(result.ops, k);
      applyOp(replay, op.type, op.a, op.b);
    }
    expect(replay).toEqual(result.final);
  });

  it("알고리즘이 던진 다른 오류는 그대로 전파한다", () => {
    const broken: Pick<SortAlgorithm, "sort"> = {
      sort() {
        throw new Error("boom");
      },
    };
    expect(() => runSort(broken, input)).toThrow("boom");
  });
});

describe("연산 기록 버퍼", () => {
  /** i번째 연산의 줄 번호에 i를 남겨, 버퍼를 늘릴 때 기록이 밀리거나 사라지지 않았는지 확인한다 */
  const numbered = (count: number): Pick<SortAlgorithm, "sort"> => ({
    sort(t) {
      for (let i = 0; i < count; i++) t.mark(i % t.length, i);
    },
  });

  it("처음 잡은 크기를 여러 번 넘겨도 모든 연산을 순서대로 담는다", () => {
    const result = runSort(numbered(5000), input);
    expect(opCount(result.ops)).toBe(5000);
    for (const k of [0, 1023, 1024, 2047, 2048, 4999]) {
      expect(readOp(result.ops, k).line).toBe(k);
    }
  });

  it("결과는 기록된 길이에 딱 맞는 별도 버퍼다 (넘길 때 여유분까지 보내지 않는다)", () => {
    const result = runSort(numbered(1500), input);
    expect(result.ops.length).toBe(1500 * 4);
    expect(result.ops.buffer.byteLength).toBe(1500 * 4 * 4);
  });

  it("늘리는 도중에 한도에 닿아도 한도까지 정확히 기록한다", () => {
    const result = runSort(endless, input, {}, { maxOps: 3001 });
    expect(result.truncated).toBe(true);
    expect(opCount(result.ops)).toBe(3001);
  });
});
