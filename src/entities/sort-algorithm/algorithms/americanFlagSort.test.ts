import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { americanFlagSort } from "./americanFlagSort";

describeSortAlgorithm(americanFlagSort);

describe("americanFlagSort", () => {
  it("보조 배열 없이 교환만 사용한다 (이동 없음)", () => {
    const { ops } = runSort(americanFlagSort, toItems(randomValues(300, 9999, 49)));
    expect(countOps(ops, OpType.Move)).toBe(0);
  });

  it("자릿수가 다른 값들이 섞여도 정렬한다", () => {
    expectSortsCorrectly(americanFlagSort, [5, 1000, 42, 9999, 0, 300, 7, 42, 1, 10, 100, 9]);
  });
});
