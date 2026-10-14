"use client";

import { useEffect, useRef, useState } from "react";
import type { ArrayItem } from "@/shared/model";
import type { BarHighlight } from "@/entities/array";
import { sweepFrequencies, valueToFrequency } from "./pitch";
import { SortSynth } from "./synth";

/** 소리에 필요한 재생 화면 정보 (재생 기능의 TrackView와 같은 모양) */
export type SoundView = {
  items: readonly ArrayItem[];
  highlight: BarHighlight;
  done: boolean;
  truncated: boolean;
};

const STORAGE_KEY = "sort-visualizer:sound";
const SWEEP_NOTES = 40;
const SWEEP_STEP_MS = 18;

function readPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false; // 저장소를 쓸 수 없으면 기본값(꺼짐)
  }
}

function savePreference(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // 저장하지 못해도 이번 세션에서는 동작한다
  }
}

function maxValue(items: readonly ArrayItem[]) {
  let max = 1;
  for (const item of items) if (item.value > max) max = item.value;
  return max;
}

/**
 * 재생 화면이 바뀔 때마다(최대 프레임당 한 번) 강조된 막대의 값을 음으로 들려준다.
 * 정렬이 끝나면 낮은 음부터 높은 음까지 올라가는 완료 효과를 낸다.
 * 비교 모드에서는 1번 슬롯을 왼쪽, 2번 슬롯을 오른쪽에서 들려준다.
 */
export function useSortSound(views: readonly SoundView[]) {
  const [enabled, setEnabled] = useState(readPreference);
  const [synth] = useState(() => new SortSynth());
  const prevDone = useRef<boolean[]>([]);

  useEffect(() => () => synth.close(), [synth]);

  // 소리가 켜진 채로 페이지를 열었을 때: 첫 클릭·키 입력에서 오디오를 깨운다
  useEffect(() => {
    if (!enabled) return;
    const unlock = () => synth.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [enabled, synth]);

  useEffect(() => {
    const wasDone = prevDone.current;
    prevDone.current = views.map((v) => v.done);
    if (!enabled || !synth.ready) return;

    views.forEach((view, slot) => {
      const pan = views.length > 1 ? (slot === 0 ? -0.6 : 0.6) : 0;
      const max = maxValue(view.items);

      // 방금 끝났고 실제로 정렬됐다면 완료 효과 (한도에 걸린 미완료는 제외)
      if (view.done && !wasDone[slot] && !view.truncated) {
        const values = view.items.map((item) => item.value);
        sweepFrequencies(values, max, SWEEP_NOTES).forEach((frequency, k) => {
          synth.blip(frequency, "compare", { pan, delayMs: k * SWEEP_STEP_MS, durationMs: 90, force: true });
        });
        return;
      }

      if (!view.highlight) return;
      for (const index of view.highlight.indices) {
        const item = view.items[index];
        if (item) synth.blip(valueToFrequency(item.value, max), view.highlight.tone, { pan });
      }
    });
  }, [views, enabled, synth]);

  const toggle = () => {
    const next = !enabled;
    // 버튼 클릭 처리 중에 깨워야 브라우저가 소리를 허용한다
    if (next) synth.unlock();
    setEnabled(next);
    savePreference(next);
  };

  return { enabled, toggle };
}
