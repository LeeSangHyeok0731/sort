import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { radixSort } from "./radixSort";

describeSortAlgorithm(radixSort);

describe("radixSort", () => {
  it("자릿수마다 모든 원소를 한 번씩 읽는다", () => {
    const values = [170, 45, 75, 90, 802, 24, 2, 66];
    const { ops } = runSort(radixSort, toItems(values));
    expect(countOps(ops, OpType.Mark)).toBe(values.length * 3);
    expect(countOps(ops, OpType.Compare)).toBe(0);
  });

  it("모든 값이 0이면 연산이 없다", () => {
    const { ops } = runSort(radixSort, toItems([0, 0, 0]));
    expect(ops).toEqual([]);
  });
});
