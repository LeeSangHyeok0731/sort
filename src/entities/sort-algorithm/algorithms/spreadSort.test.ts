import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { spreadSort } from "./spreadSort";

describeSortAlgorithm(spreadSort);

describe("spreadSort", () => {
  it("작은 칸 안에서만 비교하므로 큰 입력에서 비교가 적다", () => {
    const { ops } = expectSortsCorrectly(spreadSort, randomValues(1000, 9999, 63));
    expect(countOps(ops, OpType.Compare)).toBeLessThan(1000 * 8);
  });

  it("모든 값이 같으면 읽기만 하고 끝낸다", () => {
    const { ops } = runSort(spreadSort, toItems(Array(100).fill(9)));
    expect(countOps(ops, OpType.Swap) + countOps(ops, OpType.Compare)).toBe(0);
  });

  it("값 범위가 좁거나 넓은 다양한 입력을 정렬한다", () => {
    for (const max of [2, 16, 300, 9999]) expectSortsCorrectly(spreadSort, randomValues(500, max, max));
  });
});
