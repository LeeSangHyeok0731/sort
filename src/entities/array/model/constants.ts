export const MIN_ARRAY_SIZE = 2;
export const MAX_ARRAY_SIZE = 1000;
export const DEFAULT_ARRAY_SIZE = 20;
export const MIN_VALUE = 0;
export const MAX_VALUE = 9999;

export const PRESETS = [
  { id: "shuffled", name: "무작위 순열", desc: "1~n이 한 번씩, 섞인 순서" },
  { id: "random", name: "중복 있음", desc: "값이 겹칠 수 있는 완전 랜덤" },
  { id: "nearlySorted", name: "거의 정렬됨", desc: "정렬된 배열에서 몇 쌍만 교환" },
  { id: "reversed", name: "역순", desc: "내림차순 (많은 알고리즘의 최악)" },
  { id: "fewUnique", name: "중복 많음", desc: "값이 5종류뿐인 배열" },
] as const;

export type PresetId = (typeof PRESETS)[number]["id"];

export const DEFAULT_PRESET: PresetId = "shuffled";

export function isPresetId(id: string | null | undefined): id is PresetId {
  return PRESETS.some((p) => p.id === id);
}
