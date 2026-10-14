import { describe, expect, it } from "vitest";
import { OpType, opCount } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { stoogeSort } from "./stoogeSort";

describeSortAlgorithm(stoogeSort, { maxSize: 64 });

describe("stoogeSort", () => {
  it("연산이 폭발하는 큰 입력은 연산 한도에서 멈추고 미완료로 표시한다", () => {
    const result = runSort(stoogeSort, toItems(randomValues(300, 9999, 21)), {}, { maxOps: 50_000 });
    expect(result.truncated).toBe(true);
    expect(opCount(result.ops)).toBe(50_000);
  });

  it("비교 횟수는 입력과 무관하다", () => {
    const a = runSort(stoogeSort, toItems(Array.from({ length: 20 }, (_, i) => i)));
    const b = runSort(stoogeSort, toItems(Array.from({ length: 20 }, (_, i) => 20 - i)));
    expect(countOps(a.ops, OpType.Compare)).toBe(countOps(b.ops, OpType.Compare));
  });
});
