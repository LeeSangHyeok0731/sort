import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { BOGO_MAX_SHUFFLES, bogoSort } from "./bogoSort";

describeSortAlgorithm(bogoSort, { maxSize: 5 });

describe("bogoSort", () => {
  it("한도 안에 정렬하지 못하면 truncated를 표시한다", () => {
    const result = runSort(bogoSort, toItems(Array.from({ length: 12 }, (_, i) => 12 - i)));
    expect(result.truncated).toBe(true);
    expect(countOps(result.ops, OpType.Swap)).toBeLessThanOrEqual(BOGO_MAX_SHUFFLES * 11);
  });

  it("이미 정렬된 입력은 섞지 않는다", () => {
    const { ops, truncated } = runSort(bogoSort, toItems(Array.from({ length: 20 }, (_, i) => i)));
    expect(truncated).toBe(false);
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });
});
