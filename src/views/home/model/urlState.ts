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
import { MAX_BUCKETS, MIN_BUCKETS } from "@/features/select-algorithm";

export type HomeState = {
  algorithms: [AlgorithmId, AlgorithmId];
  compare: boolean;
  speed: number;
  size: number;
  preset: PresetId | "custom";
  /** preset이 custom일 때의 값 (공유 링크용) */
  custom: number[] | null;
  shellGaps: string;
  bucketCount: number;
};

export const DEFAULT_BUCKET_COUNT = 5;

export const DEFAULT_STATE: HomeState = {
  algorithms: [DEFAULT_ALGORITHM_ID, "quick"],
  compare: false,
  speed: DEFAULT_SPEED,
  size: DEFAULT_ARRAY_SIZE,
  preset: DEFAULT_PRESET,
  custom: null,
  shellGaps: "",
  bucketCount: DEFAULT_BUCKET_COUNT,
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
  const buckets = Number(params.get("buckets"));

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
    shellGaps: params.get("gaps") ?? "",
    bucketCount:
      params.has("buckets") && Number.isInteger(buckets)
        ? Math.min(MAX_BUCKETS, Math.max(MIN_BUCKETS, buckets))
        : DEFAULT_BUCKET_COUNT,
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
  if (state.shellGaps.trim()) params.set("gaps", state.shellGaps.trim());
  if (state.bucketCount !== DEFAULT_BUCKET_COUNT) params.set("buckets", String(state.bucketCount));
  return params.toString();
}

export function parseGaps(text: string): number[] {
  return text
    .split(/[\s,]+/)
    .map(Number)
    .filter((g) => Number.isInteger(g) && g > 0);
}
