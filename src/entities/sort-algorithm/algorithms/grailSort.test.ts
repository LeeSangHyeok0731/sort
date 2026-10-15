import { describe, expect, it } from "vitest";
import { opCount } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { grailSort } from "./grailSort";

describeSortAlgorithm(grailSort);

describe("grailSort", () => {
  it("길이 1~200, 고유 값이 버퍼보다 적은 경우까지 모두 안정 정렬한다", () => {
    for (let n = 1; n <= 200; n++) {
      expectSortsCorrectly(grailSort, randomValues(n, 1000, n + 1100));
      expectSortsCorrectly(grailSort, randomValues(n, 3, n + 1200));
      expectSortsCorrectly(grailSort, Array(n).fill(4));
    }
  });

  it("고유 값 개수에 따라 세 방식(버퍼 + 태그, 태그만, 회전 병합)이 모두 맞다", () => {
    for (const n of [255, 256, 257, 1000, 2000]) {
      for (const distinct of [2, 3, 4, 5, 8, 16, 30, 60, 100, 9999]) {
        expectSortsCorrectly(grailSort, randomValues(n, distinct, n * 7 + distinct));
      }
    }
  });

  it("정렬됨·역순·톱니 입력", () => {
    for (const n of [100, 1000]) {
      expectSortsCorrectly(grailSort, Array.from({ length: n }, (_, i) => i));
      expectSortsCorrectly(grailSort, Array.from({ length: n }, (_, i) => n - i));
      expectSortsCorrectly(grailSort, Array.from({ length: n }, (_, i) => i % 37));
    }
  });

  it("연산 수가 n log n 정도로 늘어난다 (n√n 이 아니다)", () => {
    const ops = (n: number) => opCount(runSort(grailSort, toItems(randomValues(n, 1e6, n))).ops);
    const small = ops(1000);
    const large = ops(16000);
    // n이 16배면 n log n은 약 22배, n√n은 64배
    expect(large / small).toBeLessThan(30);
  });
});
