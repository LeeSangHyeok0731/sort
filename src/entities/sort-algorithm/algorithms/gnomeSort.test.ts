import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { gnomeSort } from "./gnomeSort";

describeSortAlgorithm(gnomeSort);

describe("gnomeSort", () => {
  it("정렬된 입력은 n-1 번 비교한다", () => {
    const { ops } = runSort(gnomeSort, toItems(Array.from({ length: 30 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(29);
  });

  it("교환 횟수는 역순 쌍(inversion) 개수와 같다", () => {
    const { ops } = runSort(gnomeSort, toItems([3, 1, 2]));
    expect(countOps(ops, OpType.Swap)).toBe(2);
  });
});
