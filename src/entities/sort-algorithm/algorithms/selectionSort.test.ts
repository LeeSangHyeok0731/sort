import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { selectionSort } from "./selectionSort";

describeSortAlgorithm(selectionSort);

describe("selectionSort", () => {
  it("교환은 최대 n-1 번이다", () => {
    const { ops } = runSort(selectionSort, toItems(randomValues(100, 9999, 7)));
    expect(countOps(ops, OpType.Swap)).toBeLessThanOrEqual(99);
  });

  it("입력과 상관없이 항상 n(n-1)/2 번 비교한다", () => {
    const { ops } = runSort(selectionSort, toItems(Array.from({ length: 30 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(435);
  });
});
