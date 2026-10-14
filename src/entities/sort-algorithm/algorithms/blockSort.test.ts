import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { blockSort } from "./blockSort";

describeSortAlgorithm(blockSort);

describe("blockSort", () => {
  it("길이 1~80, 중복 많은 값까지 모두 안정 정렬한다", () => {
    for (let n = 1; n <= 80; n++) {
      expectSortsCorrectly(blockSort, randomValues(n, 1000, n + 900));
      expectSortsCorrectly(blockSort, randomValues(n, 3, n + 1000));
    }
  });

  it("큰 입력과 블록 경계가 어긋나는 크기를 정렬한다", () => {
    for (const n of [17, 33, 100, 257, 1000]) expectSortsCorrectly(blockSort, randomValues(n, 9999, n));
  });

  it("이미 정렬된 입력은 교환 없이 끝난다", () => {
    const { ops } = runSort(blockSort, toItems(Array.from({ length: 1000 }, (_, i) => i)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
    expect(countOps(ops, OpType.Move)).toBe(0);
  });
});
