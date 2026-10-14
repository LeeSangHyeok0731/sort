import { describe, it } from "vitest";
import { describeSortAlgorithm, expectSortsCorrectly } from "../testing/sortSuite";
import { quickSort } from "./quickSort";

describeSortAlgorithm(quickSort);

describe("quickSort", () => {
  it("정렬된 큰 입력(최악의 경우)에서도 스택 오버플로 없이 정렬한다", () => {
    expectSortsCorrectly(quickSort, Array.from({ length: 1000 }, (_, i) => i));
  });
});
