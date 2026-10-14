import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { pancakeSort } from "./pancakeSort";

describeSortAlgorithm(pancakeSort);

describe("pancakeSort", () => {
  it("뒤집기(교환)만 사용하고 이동은 쓰지 않는다", () => {
    const { ops } = runSort(pancakeSort, toItems(randomValues(40, 9999, 13)));
    expect(countOps(ops, OpType.Move)).toBe(0);
  });

  it("이미 제자리인 최댓값은 뒤집지 않는다", () => {
    const { ops } = runSort(pancakeSort, toItems(Array.from({ length: 10 }, (_, i) => i)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });
});
