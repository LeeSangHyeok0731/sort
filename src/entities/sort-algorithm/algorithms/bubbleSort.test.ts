import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { bubbleSort } from "./bubbleSort";

describeSortAlgorithm(bubbleSort);

describe("bubbleSort", () => {
  it("정렬된 입력은 한 번의 패스(n-1 비교)로 끝내고 교환하지 않는다", () => {
    const { ops } = runSort(bubbleSort, toItems(Array.from({ length: 50 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(49);
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });

  it("역순 입력은 n(n-1)/2 번 교환한다", () => {
    const { ops } = runSort(bubbleSort, toItems(Array.from({ length: 20 }, (_, i) => 20 - i)));
    expect(countOps(ops, OpType.Swap)).toBe(190);
  });
});
