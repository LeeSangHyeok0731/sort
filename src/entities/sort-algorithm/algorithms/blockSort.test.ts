import { describe, expect, it } from "vitest";
import { OpType, opCount } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { blockSort } from "./blockSort";

describeSortAlgorithm(blockSort);

describe("blockSort", () => {
  it("길이 1~200, 중복 많은 값까지 모두 안정 정렬한다", () => {
    for (let n = 1; n <= 200; n++) {
      expectSortsCorrectly(blockSort, randomValues(n, 1000, n + 900));
      expectSortsCorrectly(blockSort, randomValues(n, 3, n + 1000));
      expectSortsCorrectly(blockSort, Array(n).fill(4));
    }
  });

  it("고유 값이 버퍼 두 개에 충분하거나, 하나만 되거나, 거의 없을 때 모두 맞다", () => {
    for (const n of [255, 256, 257, 1000, 2000]) {
      for (const distinct of [2, 3, 5, 8, 16, 30, 60, 100, 9999]) {
        expectSortsCorrectly(blockSort, randomValues(n, distinct, n * 7 + distinct));
      }
    }
  });

  it("역순·톱니·반쯤 정렬된 입력", () => {
    for (const n of [100, 1000]) {
      expectSortsCorrectly(blockSort, Array.from({ length: n }, (_, i) => n - i));
      expectSortsCorrectly(blockSort, Array.from({ length: n }, (_, i) => i % 37));
      expectSortsCorrectly(blockSort, [...Array.from({ length: n / 2 }, (_, i) => i), ...randomValues(n / 2, n, n)]);
    }
  });

  it("이미 정렬된 입력은 교환 없이 끝난다", () => {
    const { ops } = runSort(blockSort, toItems(Array.from({ length: 1000 }, (_, i) => i)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
    expect(countOps(ops, OpType.Move)).toBe(0);
  });

  it("연산 수가 n log n 정도로 늘어난다 (n√n 이 아니다)", () => {
    const ops = (n: number) => opCount(runSort(blockSort, toItems(randomValues(n, 1e6, n))).ops);
    // n이 16배면 n log n은 약 22배, n√n은 64배
    expect(ops(16000) / ops(1000)).toBeLessThan(30);
  });
});
