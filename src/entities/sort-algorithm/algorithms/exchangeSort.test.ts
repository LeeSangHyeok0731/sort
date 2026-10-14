import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { exchangeSort } from "./exchangeSort";

describeSortAlgorithm(exchangeSort);

describe("exchangeSort", () => {
  it("입력과 상관없이 항상 n(n-1)/2번 비교한다", () => {
    const { ops } = runSort(exchangeSort, toItems(Array.from({ length: 30 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(435);
  });
});
