import {
  clampSize,
  DEFAULT_ARRAY_SIZE,
  DEFAULT_PRESET,
  isPresetId,
  parseCustomValues,
  type PresetId,
} from "@/entities/array";
import { DEFAULT_ALGORITHM_ID, isAlgorithmId, type AlgorithmId } from "@/entities/sort-algorithm";
import { DEFAULT_SPEED, SPEEDS } from "@/features/playback";
import {
  DEFAULT_OPTION_VALUES,
  MAX_BUCKETS,
  MIN_BUCKETS,
  type AlgorithmOptionValues,
} from "@/features/select-algorithm";

export type HomeState = {
  algorithms: [AlgorithmId, AlgorithmId];
  compare: boolean;
  speed: number;
  size: number;
  preset: PresetId | "custom";
  /** preset이 custom일 때의 값 (공유 링크용) */
  custom: number[] | null;
  /** 슬롯별 알고리즘 고유 옵션 (셸 간격, 버킷 수) */
  slotOptions: [AlgorithmOptionValues, AlgorithmOptionValues];
};

export const DEFAULT_SLOT_OPTIONS = DEFAULT_OPTION_VALUES;

/** 슬롯별 URL 키: 1번은 기존 링크 호환을 위해 접미사 없음 */
const OPTION_KEYS = [
  { gaps: "gaps", buckets: "buckets" },
  { gaps: "gaps2", buckets: "buckets2" },
] as const;

function readSlotOptions(params: URLSearchParams, slot: 0 | 1): AlgorithmOptionValues {
  const keys = OPTION_KEYS[slot];
  const buckets = Number(params.get(keys.buckets));
  return {
    shellGaps: params.get(keys.gaps) ?? DEFAULT_SLOT_OPTIONS.shellGaps,
    bucketCount:
      params.has(keys.buckets) && Number.isInteger(buckets)
        ? Math.min(MAX_BUCKETS, Math.max(MIN_BUCKETS, buckets))
        : DEFAULT_SLOT_OPTIONS.bucketCount,
  };
}

function writeSlotOptions(params: URLSearchParams, slot: 0 | 1, values: AlgorithmOptionValues) {
  const keys = OPTION_KEYS[slot];
  if (values.shellGaps.trim()) params.set(keys.gaps, values.shellGaps.trim());
  if (values.bucketCount !== DEFAULT_SLOT_OPTIONS.bucketCount) {
    params.set(keys.buckets, String(values.bucketCount));
  }
}

export const DEFAULT_STATE: HomeState = {
  algorithms: [DEFAULT_ALGORITHM_ID, "quick"],
  compare: false,
  speed: DEFAULT_SPEED,
  size: DEFAULT_ARRAY_SIZE,
  preset: DEFAULT_PRESET,
  custom: null,
  slotOptions: [DEFAULT_SLOT_OPTIONS, DEFAULT_SLOT_OPTIONS],
};

function nearestSpeed(value: number) {
  return SPEEDS.reduce((best, s) => (Math.abs(s - value) < Math.abs(best - value) ? s : best), DEFAULT_SPEED);
}

/** 쿼리 문자열을 상태로 해석한다. 잘못된 값은 기본값으로 대체한다. */
export function readState(search: string): HomeState {
  const params = new URLSearchParams(search);
  const algo = params.get("algo");
  const algo2 = params.get("algo2");
  const speed = Number(params.get("speed"));
  const size = Number(params.get("size"));

  const state: HomeState = {
    algorithms: [
      isAlgorithmId(algo) ? algo : DEFAULT_STATE.algorithms[0],
      isAlgorithmId(algo2) ? algo2 : DEFAULT_STATE.algorithms[1],
    ],
    compare: params.get("compare") === "true",
    speed: params.has("speed") && Number.isFinite(speed) ? nearestSpeed(speed) : DEFAULT_SPEED,
    size: params.has("size") && Number.isFinite(size) ? clampSize(size) : DEFAULT_ARRAY_SIZE,
    preset: DEFAULT_PRESET,
    custom: null,
    slotOptions: [readSlotOptions(params, 0), readSlotOptions(params, 1)],
  };

  const data = params.get("data");
  const parsed = data ? parseCustomValues(data) : null;
  if (parsed?.ok) {
    state.preset = "custom";
    state.custom = parsed.values;
    state.size = parsed.values.length;
  } else {
    const preset = params.get("preset");
    if (isPresetId(preset)) state.preset = preset;
  }
  return state;
}

/** 상태를 쿼리 문자열로 만든다. 기본값과 같은 선택 항목은 생략한다. */
export function writeState(state: HomeState): string {
  const params = new URLSearchParams();
  params.set("algo", state.algorithms[0]);
  if (state.compare) {
    params.set("compare", "true");
    params.set("algo2", state.algorithms[1]);
  }
  params.set("speed", String(state.speed));
  params.set("size", String(state.size));
  if (state.preset === "custom" && state.custom) {
    params.set("data", state.custom.join(","));
  } else if (state.preset !== DEFAULT_PRESET) {
    params.set("preset", state.preset);
  }
  writeSlotOptions(params, 0, state.slotOptions[0]);
  if (state.compare) writeSlotOptions(params, 1, state.slotOptions[1]);
  return params.toString();
}

export function parseGaps(text: string): number[] {
  return text
    .split(/[\s,]+/)
    .map(Number)
    .filter((g) => Number.isInteger(g) && g > 0);
}
