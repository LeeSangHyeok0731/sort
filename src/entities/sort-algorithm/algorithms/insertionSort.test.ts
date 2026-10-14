import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { insertionSort } from "./insertionSort";

describeSortAlgorithm(insertionSort);

describe("insertionSort", () => {
  it("정렬된 입력은 n-1 번 비교만 한다", () => {
    const { ops } = runSort(insertionSort, toItems(Array.from({ length: 40 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(39);
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });
});
