import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { BOZO_MAX_SWAPS, bozoSort } from "./bozoSort";

describeSortAlgorithm(bozoSort, { maxSize: 5 });

describe("bozoSort", () => {
  it("한도 안에 정렬하지 못하면 truncated를 표시한다", () => {
    const result = runSort(bozoSort, toItems(Array.from({ length: 12 }, (_, i) => 12 - i)));
    expect(result.truncated).toBe(true);
    expect(countOps(result.ops, OpType.Swap)).toBeLessThanOrEqual(BOZO_MAX_SWAPS);
  });

  it("이미 정렬된 입력은 교환하지 않는다", () => {
    const { ops, truncated } = runSort(bozoSort, toItems(Array.from({ length: 20 }, (_, i) => i)));
    expect(truncated).toBe(false);
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });
});
