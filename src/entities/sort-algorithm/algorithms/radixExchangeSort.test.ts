import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { radixExchangeSort } from "./radixExchangeSort";

describeSortAlgorithm(radixExchangeSort);

describe("radixExchangeSort", () => {
  it("값을 비교하지 않는다 (비트 읽기와 교환만)", () => {
    const { ops } = runSort(radixExchangeSort, toItems(randomValues(200, 9999, 50)));
    expect(countOps(ops, OpType.Compare)).toBe(0);
    expect(countOps(ops, OpType.Move)).toBe(0);
  });

  it("모든 값이 0이면 연산이 없다", () => {
    expect(runSort(radixExchangeSort, toItems([0, 0, 0])).ops).toHaveLength(0);
  });
});
