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
