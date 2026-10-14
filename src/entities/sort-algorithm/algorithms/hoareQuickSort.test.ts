import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { quickSort } from "./quickSort";
import { hoareQuickSort } from "./hoareQuickSort";

describeSortAlgorithm(hoareQuickSort);

describe("hoareQuickSort", () => {
  it("Lomuto 분할(기존 퀵 정렬)보다 교환이 적다", () => {
    const values = randomValues(1000, 9999, 43);
    const hoare = runSort(hoareQuickSort, toItems(values));
    const lomuto = runSort(quickSort, toItems(values));
    expect(countOps(hoare.ops, OpType.Swap)).toBeLessThan(countOps(lomuto.ops, OpType.Swap));
  });

  it("정렬된·모두 같은 큰 입력도 정렬한다 (가운데 피벗)", () => {
    expectSortsCorrectly(hoareQuickSort, Array.from({ length: 1000 }, (_, i) => i));
    expectSortsCorrectly(hoareQuickSort, Array(1000).fill(5));
  });
});
