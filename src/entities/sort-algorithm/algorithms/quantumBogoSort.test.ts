import { describe, expect, it } from "vitest";
import { runSort } from "../model/run";
import { toItems } from "../testing/sortSuite";
import { quantumBogoSort } from "./quantumBogoSort";

describe("quantumBogoSort", () => {
  it("빈 배열과 원소 1개는 항상 살아남는다", () => {
    expect(runSort(quantumBogoSort, []).truncated).toBe(false);
    expect(runSort(quantumBogoSort, toItems([7])).truncated).toBe(false);
  });

  it("섞은 결과가 정렬돼 있을 때만 살아남는다 (그 외에는 우주 파괴 = 미완료)", () => {
    for (let k = 0; k < 200; k++) {
      const { final, truncated } = runSort(quantumBogoSort, toItems([3, 1, 2]));
      const sorted = final.every((x, i) => i === 0 || final[i - 1].value <= x.value);
      expect(truncated).toBe(!sorted);
      expect(final.map((x) => x.id).sort()).toEqual([0, 1, 2]);
    }
  });
});
