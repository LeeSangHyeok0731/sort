import { describe, expect, it } from "vitest";
import { describeSortAlgorithm, expectSortsCorrectly, randomValues } from "../testing/sortSuite";
import { minRunLength, timSort } from "./timSort";

describeSortAlgorithm(timSort);

describe("timSort", () => {
  it("minRun 길이는 32 미만이면 n, 그 이상이면 16~32 사이다", () => {
    expect(minRunLength(10)).toBe(10);
    expect(minRunLength(64)).toBe(16);
    expect(minRunLength(65)).toBe(17);
    expect(minRunLength(1000)).toBeGreaterThanOrEqual(16);
    expect(minRunLength(1000)).toBeLessThanOrEqual(32);
  });

  it("여러 런을 병합하는 큰 입력을 정렬한다", () => {
    expectSortsCorrectly(timSort, randomValues(1000, 9999, 11));
  });
});
