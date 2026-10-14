import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { heapSort } from "./heapSort";
import { bottomUpHeapSort } from "./bottomUpHeapSort";

describeSortAlgorithm(bottomUpHeapSort);

describe("bottomUpHeapSort", () => {
  it("일반 힙 정렬보다 비교가 확실히 적다", () => {
    const values = randomValues(1000, 9999, 45);
    const bottomUp = runSort(bottomUpHeapSort, toItems(values));
    const plain = runSort(heapSort, toItems(values));
    expect(countOps(bottomUp.ops, OpType.Compare)).toBeLessThan(countOps(plain.ops, OpType.Compare) * 0.8);
  });
});
