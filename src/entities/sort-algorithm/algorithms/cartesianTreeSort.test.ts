import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { cartesianTreeSort } from "./cartesianTreeSort";

describeSortAlgorithm(cartesianTreeSort);

describe("cartesianTreeSort", () => {
  it("정렬된 입력은 트리가 한 줄이라 큐가 작게 유지돼 비교가 O(n)이다", () => {
    const { ops } = runSort(cartesianTreeSort, toItems(Array.from({ length: 1000 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(2 * 1000);
  });

  it("큰 무작위·역순 입력을 정렬한다", () => {
    expectSortsCorrectly(cartesianTreeSort, randomValues(1000, 9999, 65));
    expectSortsCorrectly(cartesianTreeSort, Array.from({ length: 1000 }, (_, i) => 1000 - i));
  });
});
