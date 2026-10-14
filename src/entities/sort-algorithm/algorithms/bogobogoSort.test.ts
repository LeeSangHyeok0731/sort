import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, toItems } from "../testing/sortSuite";
import { bogobogoSort } from "./bogobogoSort";

describeSortAlgorithm(bogobogoSort, { maxSize: 4 });

describe("bogobogoSort", () => {
  it("이미 정렬된 입력은 교환 없이 끝난다", () => {
    const { ops, truncated } = runSort(bogobogoSort, toItems([1, 2, 3, 4, 5, 6, 7, 8]));
    expect(truncated).toBe(false);
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });

  it("복사본으로 확인한 뒤 되돌리는 교환이 기록된다 (교환 수가 짝수 쌍으로 상쇄)", () => {
    const result = expectSortsCorrectly(bogobogoSort, [2, 1]);
    // 1) 복사본 정렬(교환) 2) 원본과 다르므로 되돌림(교환) 3) 원본 섞기 ... 마지막 확인에서 교환 없이 통과
    expect(countOps(result.ops, OpType.Swap)).toBeGreaterThanOrEqual(2);
  });

  it("원소 6개는 연산 한도에 걸린다", () => {
    expect(runSort(bogobogoSort, toItems([6, 5, 4, 3, 2, 1])).truncated).toBe(true);
  });
});
