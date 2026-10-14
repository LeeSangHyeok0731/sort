import { describe, expect, it } from "vitest";
import { isSlotAudible, NO_MUTES, slotPan, toggleSlotMute } from "./slots";

describe("슬롯별 음소거", () => {
  it("비교 모드에서 음소거한 슬롯만 조용하다", () => {
    const mutes = toggleSlotMute(NO_MUTES, 0);
    expect(isSlotAudible(mutes, 0, 2)).toBe(false);
    expect(isSlotAudible(mutes, 1, 2)).toBe(true);
  });

  it("단일 모드에서는 슬롯 음소거를 무시한다", () => {
    const mutes = toggleSlotMute(NO_MUTES, 0);
    expect(isSlotAudible(mutes, 0, 1)).toBe(true);
  });

  it("두 번 누르면 다시 켜진다", () => {
    expect(toggleSlotMute(toggleSlotMute(NO_MUTES, 1), 1)).toEqual(NO_MUTES);
  });

  it("두 슬롯을 모두 끌 수 있다", () => {
    const both = toggleSlotMute(toggleSlotMute(NO_MUTES, 0), 1);
    expect(isSlotAudible(both, 0, 2) || isSlotAudible(both, 1, 2)).toBe(false);
  });
});

describe("slotPan", () => {
  it("비교 모드는 1번 왼쪽, 2번 오른쪽, 단일 모드는 가운데", () => {
    expect(slotPan(0, 2)).toBeLessThan(0);
    expect(slotPan(1, 2)).toBeGreaterThan(0);
    expect(slotPan(0, 1)).toBe(0);
  });
});
