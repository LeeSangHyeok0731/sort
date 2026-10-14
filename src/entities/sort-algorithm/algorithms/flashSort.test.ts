import { describe, expect, it } from "vitest";
import { OpType, opCount } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { flashSort } from "./flashSort";

describeSortAlgorithm(flashSort);

describe("flashSort", () => {
  it("모든 값이 같으면 분류 없이 끝낸다", () => {
    const { ops } = runSort(flashSort, toItems(Array(50).fill(3)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
    expect(countOps(ops, OpType.Mark)).toBe(0);
  });

  it("고르게 퍼진 큰 입력은 선형에 가까운 연산으로 정렬한다", () => {
    const { ops } = expectSortsCorrectly(flashSort, randomValues(1000, 9999, 48));
    expect(opCount(ops)).toBeLessThan(1000 * 15);
  });
});
