import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { mergeSort } from "./mergeSort";

describeSortAlgorithm(mergeSort);

describe("mergeSort", () => {
  it("교환 없이 비교와 이동만으로 병합한다", () => {
    const { ops } = runSort(mergeSort, toItems(randomValues(64, 50, 3)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
    expect(countOps(ops, OpType.Move)).toBeGreaterThan(0);
  });

  it("비교 횟수는 n·log2(n) 이하이다", () => {
    const { ops } = runSort(mergeSort, toItems(randomValues(256, 9999, 5)));
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(256 * 8);
  });
});
