import { describe, it } from "vitest";
import { describeSortAlgorithm, expectSortsCorrectly, randomValues } from "../testing/sortSuite";
import { combSort } from "./combSort";

describeSortAlgorithm(combSort);

describe("combSort", () => {
  it("큰 무작위 입력을 정렬한다", () => {
    expectSortsCorrectly(combSort, randomValues(500, 9999, 12));
  });
});
