import { describe, expect, it } from "vitest";
import { describeSortAlgorithm, expectSortsCorrectly, randomValues } from "../testing/sortSuite";
import { normalizeGaps, shellSort } from "./shellSort";

describeSortAlgorithm(shellSort);
describeSortAlgorithm(shellSort, { options: { shellGaps: [701, 301, 132, 57, 23, 10, 4, 1] } });
describeSortAlgorithm(shellSort, { options: { shellGaps: [5, 3] } });

describe("shellSort", () => {
  it("간격이 비어 있으면 n/2, n/4, ..., 1을 쓴다", () => {
    expect(normalizeGaps([], 20)).toEqual([10, 5, 2, 1]);
    expect(normalizeGaps(undefined, 9)).toEqual([4, 2, 1]);
  });

  it("사용자 간격은 정리하고 마지막에 1을 보장한다", () => {
    expect(normalizeGaps([3, 5, 5, -1, 0, 2.5, 100], 20)).toEqual([5, 3, 1]);
    expect(normalizeGaps([4, 1], 20)).toEqual([4, 1]);
  });

  it("1이 빠진 간격으로도 정렬을 끝낸다", () => {
    expectSortsCorrectly(shellSort, randomValues(50, 9999, 4), { shellGaps: [7, 3] });
  });
});
