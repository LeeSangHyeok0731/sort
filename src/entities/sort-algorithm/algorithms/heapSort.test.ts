import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { heapSort } from "./heapSort";

describeSortAlgorithm(heapSort);

describe("heapSort", () => {
  it("이동 연산 없이 비교와 교환만 사용한다", () => {
    const { ops } = runSort(heapSort, toItems(randomValues(100, 9999, 9)));
    expect(countOps(ops, OpType.Move)).toBe(0);
  });
});
