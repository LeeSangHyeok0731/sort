import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { quickSort } from "./quickSort";
import { threeWayQuickSort } from "./threeWayQuickSort";

describeSortAlgorithm(threeWayQuickSort);

describe("threeWayQuickSort", () => {
  it("모든 값이 같으면 한 번의 분할(n-1 비교)로 끝난다", () => {
    const { ops } = runSort(threeWayQuickSort, toItems(Array(500).fill(7)));
    expect(countOps(ops, OpType.Compare)).toBe(499);
  });

  it("중복이 많은 입력에서 일반 퀵 정렬보다 비교가 적다", () => {
    const values = randomValues(500, 5, 26);
    const three = runSort(threeWayQuickSort, toItems(values));
    const plain = runSort(quickSort, toItems(values));
    expect(countOps(three.ops, OpType.Compare)).toBeLessThan(countOps(plain.ops, OpType.Compare));
  });

  it("정렬된 큰 입력도 정렬한다 (가운데 피벗)", () => {
    expectSortsCorrectly(threeWayQuickSort, Array.from({ length: 1000 }, (_, i) => i));
  });
});
