import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { slowSort } from "./slowSort";

describeSortAlgorithm(slowSort, { maxSize: 33 });

describe("slowSort", () => {
  it("비교 횟수는 점화식 C(n) = C(⌈n/2⌉) + C(⌊n/2⌋) + 1 + C(n-1)을 따른다", () => {
    const C = [0, 0];
    for (let n = 2; n <= 16; n++) C[n] = C[Math.ceil(n / 2)] + C[Math.floor(n / 2)] + 1 + C[n - 1];
    const { ops } = runSort(slowSort, toItems(randomValues(16, 100, 22)));
    expect(countOps(ops, OpType.Compare)).toBe(C[16]);
  });

  it("큰 입력은 연산 한도에서 멈춘다", () => {
    const result = runSort(slowSort, toItems(randomValues(80, 9999, 23)), {}, { maxOps: 20_000 });
    expect(result.truncated).toBe(true);
  });
});
