import type { ArrayItem } from "@/shared/model";
import { MAX_ARRAY_SIZE, MIN_ARRAY_SIZE, type PresetId } from "../model/constants";

let nextId = 1;

/** 새 배열마다 고유 id를 부여해 막대 key가 이전 배열과 겹치지 않게 한다. */
export function toArrayItems(values: readonly number[]): ArrayItem[] {
  return values.map((value) => ({ id: nextId++, value }));
}

export function clampSize(size: number) {
  if (!Number.isFinite(size)) return MIN_ARRAY_SIZE;
  return Math.min(MAX_ARRAY_SIZE, Math.max(MIN_ARRAY_SIZE, Math.round(size)));
}

function shuffle(values: number[], rand: () => number) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

export function generateValues(
  size: number,
  preset: PresetId,
  rand: () => number = Math.random
): number[] {
  const n = clampSize(size);
  const ascending = Array.from({ length: n }, (_, i) => i + 1);

  switch (preset) {
    case "shuffled":
      return shuffle(ascending, rand);
    case "random":
      return Array.from({ length: n }, () => Math.floor(rand() * n * 1.5) + 1);
    case "reversed":
      return ascending.reverse();
    case "nearlySorted": {
      const swaps = Math.max(1, Math.floor(n / 20));
      for (let k = 0; k < swaps; k++) {
        const i = Math.floor(rand() * (n - 1));
        [ascending[i], ascending[i + 1]] = [ascending[i + 1], ascending[i]];
      }
      return ascending;
    }
    case "fewUnique": {
      const step = Math.max(1, Math.floor(n / 5));
      return Array.from({ length: n }, () => (Math.floor(rand() * 5) + 1) * step);
    }
  }
}

/** 값 목록을 섞은 새 배열 (커스텀 배열 다시 섞기용) */
export function shuffleValues(values: readonly number[], rand: () => number = Math.random): number[] {
  return shuffle([...values], rand);
}

export function generateArray(size: number, preset: PresetId): ArrayItem[] {
  return toArrayItems(generateValues(size, preset));
}
