/** 슬롯별 음소거 상태 (비교 모드의 1번·2번 알고리즘) */
export type SlotMutes = readonly [boolean, boolean];

export const NO_MUTES: SlotMutes = [false, false];

/**
 * 이 슬롯의 소리를 낼지 정한다.
 * 슬롯 음소거는 비교 모드(슬롯 2개 이상)에서만 적용한다.
 * 비교 모드에서 1번을 꺼 둔 채 단일 모드로 돌아가도 소리가 나도록.
 */
export function isSlotAudible(mutes: SlotMutes, slot: number, slotCount: number) {
  if (slotCount < 2) return true;
  return !mutes[slot];
}

/** 비교 모드에서 슬롯의 좌우 위치 (-1 왼쪽 ~ 1 오른쪽). 단일 모드는 가운데. */
export function slotPan(slot: number, slotCount: number) {
  if (slotCount < 2) return 0;
  return slot === 0 ? -0.6 : 0.6;
}

export function toggleSlotMute(mutes: SlotMutes, slot: 0 | 1): SlotMutes {
  return slot === 0 ? [!mutes[0], mutes[1]] : [mutes[0], !mutes[1]];
}
