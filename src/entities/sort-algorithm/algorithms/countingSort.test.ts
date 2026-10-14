import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { countingSort } from "./countingSort";

describeSortAlgorithm(countingSort);

describe("countingSort", () => {
  it("값을 비교하지 않는다 (읽기와 이동만 사용)", () => {
    const { ops } = runSort(countingSort, toItems(randomValues(80, 30, 2)));
    expect(countOps(ops, OpType.Compare)).toBe(0);
    expect(countOps(ops, OpType.Swap)).toBe(0);
    expect(countOps(ops, OpType.Mark)).toBe(80);
  });

  it("값 범위가 넓어도 정렬한다", () => {
    expectSortsCorrectly(countingSort, [9999, 0, 5000, 1, 9998]);
  });
});
