import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues } from "../testing/sortSuite";
import { pdqSort } from "./pdqSort";

describeSortAlgorithm(pdqSort);

describe("pdqSort", () => {
  it("정렬된 큰 입력은 이미 분할됨을 감지해 O(n)에 끝낸다", () => {
    const { ops } = expectSortsCorrectly(pdqSort, Array.from({ length: 1000 }, (_, i) => i));
    expect(countOps(ops, OpType.Compare)).toBeLessThan(3 * 1000);
  });

  it("모든 값이 같은 큰 입력은 같은 값 묶음을 건너뛰어 O(n)에 끝낸다", () => {
    const { ops } = expectSortsCorrectly(pdqSort, Array(1000).fill(7));
    expect(countOps(ops, OpType.Compare)).toBeLessThan(4 * 1000);
  });

  it("역순·산 모양·중복 많은 큰 입력을 정렬한다", () => {
    expectSortsCorrectly(pdqSort, Array.from({ length: 1000 }, (_, i) => 1000 - i));
    expectSortsCorrectly(pdqSort, [...Array.from({ length: 1000 }, (_, i) => i).slice(0, 500), ...Array.from({ length: 1000 }, (_, i) => 1000 - i).slice(500)]);
    expectSortsCorrectly(pdqSort, randomValues(1000, 4, 51));
    expectSortsCorrectly(pdqSort, randomValues(1000, 9999, 52));
  });
});
