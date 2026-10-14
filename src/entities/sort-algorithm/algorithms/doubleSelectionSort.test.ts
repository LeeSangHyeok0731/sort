import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { doubleSelectionSort } from "./doubleSelectionSort";

describeSortAlgorithm(doubleSelectionSort);

describe("doubleSelectionSort", () => {
  it("한 번 훑을 때 양 끝 두 자리를 채우므로 교환은 최대 2⌊n/2⌋번이다", () => {
    const { ops } = runSort(doubleSelectionSort, toItems(randomValues(101, 9999, 41)));
    expect(countOps(ops, OpType.Swap)).toBeLessThanOrEqual(100);
  });

  it("최댓값이 맨 앞에 있는 경우를 처리한다", () => {
    expectSortsCorrectly(doubleSelectionSort, [9, 1, 5, 3, 7]);
    expectSortsCorrectly(doubleSelectionSort, [9, 9, 1, 1]);
  });
});
