import { describe, expect, it } from "vitest";
import { runSort } from "@/entities/sort-algorithm";
import type { ArrayItem } from "@/shared/model";
import { buildPlayerSlots } from "./slots";
import { DEFAULT_STATE, type HomeState } from "./urlState";

const compareBuckets: HomeState = {
  ...DEFAULT_STATE,
  compare: true,
  algorithms: ["bucket", "bucket"],
  slotOptions: [
    { shellGaps: "", bucketCount: 2 },
    { shellGaps: "", bucketCount: 15 },
  ],
};

describe("buildPlayerSlots", () => {
  it("비교 모드에서 슬롯마다 자기 버킷 수를 쓴다", () => {
    const [a, b] = buildPlayerSlots(compareBuckets);
    expect(a.options.bucketCount).toBe(2);
    expect(b.options.bucketCount).toBe(15);
  });

  it("슬롯마다 자기 셸 간격을 쓴다", () => {
    const [a, b] = buildPlayerSlots({
      ...compareBuckets,
      algorithms: ["shell", "shell"],
      slotOptions: [
        { shellGaps: "5, 1", bucketCount: 5 },
        { shellGaps: "", bucketCount: 5 },
      ],
    });
    expect(a.options.shellGaps).toEqual([5, 1]);
    expect(b.options.shellGaps).toEqual([]);
  });

  it("옵션이 다르면 실제 정렬 과정도 달라진다", () => {
    const input: ArrayItem[] = [40, 3, 77, 15, 91, 8, 52, 66, 21, 34].map((value, id) => ({ id, value }));
    const [a, b] = buildPlayerSlots(compareBuckets);
    expect(runSort(a.algorithm, input, a.options).ops).not.toEqual(runSort(b.algorithm, input, b.options).ops);
  });

  it("비교 모드가 아니면 1번 슬롯만 만든다", () => {
    const slots = buildPlayerSlots({ ...compareBuckets, compare: false });
    expect(slots).toHaveLength(1);
    expect(slots[0].options.bucketCount).toBe(2);
  });
});
