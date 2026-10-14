import { describe, expect, it } from "vitest";
import { describeSortAlgorithm, expectSortsCorrectly, randomValues } from "../testing/sortSuite";
import { grailSort } from "./grailSort";

describeSortAlgorithm(grailSort);

describe("grailSort", () => {
  it("길이 1~80, 고유 값이 버퍼보다 적은 경우까지 모두 안정 정렬한다", () => {
    for (let n = 1; n <= 80; n++) {
      expectSortsCorrectly(grailSort, randomValues(n, 1000, n + 1100));
      expectSortsCorrectly(grailSort, randomValues(n, 3, n + 1200));
      expectSortsCorrectly(grailSort, Array(n).fill(4));
    }
  });

  it("큰 입력을 정렬한다", () => {
    expectSortsCorrectly(grailSort, randomValues(1000, 9999, 61));
    expectSortsCorrectly(grailSort, randomValues(1000, 20, 62));
  });
});
