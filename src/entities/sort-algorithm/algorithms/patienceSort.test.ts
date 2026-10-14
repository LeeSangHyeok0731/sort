import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { describeSortAlgorithm, countOps, expectSortsCorrectly } from "../testing/sortSuite";
import { patienceSort } from "./patienceSort";

describeSortAlgorithm(patienceSort);

describe("patienceSort", () => {
  it("역순 입력은 더미 하나에 쌓여 병합이 필요 없다", () => {
    const { ops } = expectSortsCorrectly(patienceSort, Array.from({ length: 100 }, (_, i) => 100 - i));
    // 더미가 하나뿐이라 이진 탐색 비교 1번씩
    expect(countOps(ops, OpType.Compare)).toBe(99);
  });
});
