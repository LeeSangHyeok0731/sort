import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { mergeSort } from "./mergeSort";
import { naturalMergeSort } from "./naturalMergeSort";

describeSortAlgorithm(naturalMergeSort);

describe("naturalMergeSort", () => {
  it("정렬된 입력은 런 하나로 인식해 n-1번 비교로 끝낸다", () => {
    const { ops } = runSort(naturalMergeSort, toItems(Array.from({ length: 100 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(99);
    expect(countOps(ops, OpType.Move)).toBe(0);
  });

  it("런이 적은 입력은 일반 병합 정렬보다 비교가 적다", () => {
    const values = [...Array.from({ length: 100 }, (_, i) => i).slice(50), ...Array.from({ length: 100 }, (_, i) => i).slice(0, 50)];
    const natural = runSort(naturalMergeSort, toItems(values));
    const plain = runSort(mergeSort, toItems(values));
    expect(countOps(natural.ops, OpType.Compare)).toBeLessThan(countOps(plain.ops, OpType.Compare));
  });
});
