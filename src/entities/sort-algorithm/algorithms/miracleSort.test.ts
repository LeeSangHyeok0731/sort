import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { countOps, toItems } from "../testing/sortSuite";
import { MIRACLE_MAX_CHECKS, miracleSort } from "./miracleSort";

describe("miracleSort", () => {
  it("이미 정렬된 배열이면 확인 한 번으로 끝난다", () => {
    const { ops, final, truncated } = runSort(miracleSort, toItems([1, 2, 2, 5]));
    expect(truncated).toBe(false);
    expect(final.map((x) => x.value)).toEqual([1, 2, 2, 5]);
    expect(countOps(ops, OpType.Compare)).toBe(3);
  });

  it("빈 배열과 원소 1개는 기적 없이도 정렬돼 있다", () => {
    expect(runSort(miracleSort, []).truncated).toBe(false);
    expect(runSort(miracleSort, toItems([7])).truncated).toBe(false);
  });

  it("정렬되지 않은 배열은 절대 바꾸지 않고 기다리다 미완료로 끝난다", () => {
    const input = toItems([3, 1, 2]);
    const { ops, final, truncated } = runSort(miracleSort, input);
    expect(truncated).toBe(true);
    expect(final).toEqual(input);
    expect(countOps(ops, OpType.Swap) + countOps(ops, OpType.Move)).toBe(0);
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(MIRACLE_MAX_CHECKS * 2);
  });
});
