import { describe, it } from "vitest";
import { describeSortAlgorithm, expectSortsCorrectly, randomValues } from "../testing/sortSuite";
import { dualPivotQuickSort } from "./dualPivotQuickSort";

describeSortAlgorithm(dualPivotQuickSort);

describe("dualPivotQuickSort", () => {
  it("정렬된·역순 큰 입력도 스택 오버플로 없이 정렬한다", () => {
    expectSortsCorrectly(dualPivotQuickSort, Array.from({ length: 1000 }, (_, i) => i));
    expectSortsCorrectly(dualPivotQuickSort, Array.from({ length: 1000 }, (_, i) => 1000 - i));
  });

  it("중복이 많은 큰 입력을 정렬한다", () => {
    expectSortsCorrectly(dualPivotQuickSort, randomValues(1000, 4, 27));
  });
});
