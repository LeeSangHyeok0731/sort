import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { jacobsthalInsertionOrder, mergeInsertionSort } from "./mergeInsertionSort";

describeSortAlgorithm(mergeInsertionSort);

describe("mergeInsertionSort", () => {
  /** Ford–Johnson의 최악 비교 횟수 F(n) = Σ_(k=1..n) ⌈log2(3k/4)⌉ */
  const F = (n: number) => {
    let sum = 0;
    for (let k = 1; k <= n; k++) sum += Math.ceil(Math.log2((3 * k) / 4));
    return sum;
  };

  it("F(n)의 알려진 값과 일치한다", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(F)).toEqual([0, 1, 3, 5, 7, 10, 13, 16, 19, 22, 26, 30]);
  });

  it("어떤 입력에서도 비교 횟수가 F(n)을 넘지 않는다", () => {
    for (let n = 1; n <= 40; n++) {
      for (const seed of [1, 2, 3]) {
        const { ops } = expectSortsCorrectly(mergeInsertionSort, randomValues(n, 1_000_000, n * 10 + seed));
        expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(F(n));
      }
    }
  });

  it("야콥스탈 순서로 대기 원소를 넣는다", () => {
    expect(jacobsthalInsertionOrder(6)).toEqual([2, 1, 4, 3, 5]);
    expect(jacobsthalInsertionOrder(2)).toEqual([1]);
    expect(jacobsthalInsertionOrder(1)).toEqual([]);
  });

  it("비교가 끝난 뒤에만 원소를 옮긴다", () => {
    const { ops } = runSort(mergeInsertionSort, toItems(randomValues(50, 9999, 66)));
    let lastCompare = -1;
    let firstMove = Infinity;
    for (let k = 0; k < ops.length; k += 3) {
      if (ops[k] === OpType.Compare) lastCompare = k;
      if (ops[k] === OpType.Move) firstMove = Math.min(firstMove, k);
    }
    expect(lastCompare).toBeLessThan(firstMove);
  });
});
