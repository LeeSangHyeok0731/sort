import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { tournamentSort } from "./tournamentSort";

describeSortAlgorithm(tournamentSort);

describe("tournamentSort", () => {
  it("첫 대진 n-1번 + 재경기마다 최대 ⌈log2 n⌉번 비교한다", () => {
    const n = 1000;
    const { ops } = runSort(tournamentSort, toItems(randomValues(n, 9999, 53)));
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(n - 1 + n * 10);
  });
});
