import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { bottomUpMergeSort } from "./bottomUpMergeSort";

describeSortAlgorithm(bottomUpMergeSort);

describe("bottomUpMergeSort", () => {
  it("교환 없이 비교와 이동만 사용하고 비교는 n·log2(n) 이하다", () => {
    const { ops } = runSort(bottomUpMergeSort, toItems(randomValues(256, 9999, 42)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(256 * 8);
  });
});
