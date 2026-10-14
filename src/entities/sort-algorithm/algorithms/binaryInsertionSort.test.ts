import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { insertionSort } from "./insertionSort";
import { binaryInsertionSort } from "./binaryInsertionSort";

describeSortAlgorithm(binaryInsertionSort);

describe("binaryInsertionSort", () => {
  it("교환 없이 이동만 사용한다", () => {
    const { ops } = runSort(binaryInsertionSort, toItems(randomValues(100, 9999, 28)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });

  it("비교 횟수는 Σ⌈log2(i+1)⌉ 이하다", () => {
    const n = 200;
    let bound = 0;
    for (let i = 1; i < n; i++) bound += Math.ceil(Math.log2(i + 1));
    const { ops } = runSort(binaryInsertionSort, toItems(randomValues(n, 9999, 29)));
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(bound);
  });

  it("무작위 입력에서 일반 삽입 정렬보다 비교가 훨씬 적다", () => {
    const values = randomValues(200, 9999, 30);
    const binary = runSort(binaryInsertionSort, toItems(values));
    const plain = runSort(insertionSort, toItems(values));
    expect(countOps(binary.ops, OpType.Compare) * 3).toBeLessThan(countOps(plain.ops, OpType.Compare));
  });
});
