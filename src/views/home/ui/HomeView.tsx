"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui";
import type { ArrayItem } from "@/shared/model";
import { DEFAULT_PRESET, generateArray, MIN_ARRAY_SIZE, shuffleValues, toArrayItems, type PresetId } from "@/entities/array";
import { AlgorithmInfoCard, getAlgorithm, type AlgorithmId } from "@/entities/sort-algorithm";
import { ArrayConfigurator } from "@/features/configure-array";
import { PlaybackBar, useSortPlayer } from "@/features/playback";
import { SlotMuteButton, SoundToggle, useSortSound } from "@/features/sort-sound";
import {
  AlgorithmOptions,
  AlgorithmPicker,
  type AlgorithmOptionValues,
  type Slot,
} from "@/features/select-algorithm";
import { VisualizerStage } from "@/widgets/visualizer";
import { activeAlgorithmIds, buildPlayerSlots } from "../model/slots";
import { readState, writeState, type HomeState } from "../model/urlState";
import { useKeyboardShortcuts } from "../model/useKeyboardShortcuts";

function initialInput(state: HomeState): ArrayItem[] {
  if (state.preset !== "custom") return generateArray(state.size, state.preset);
  return state.custom ? toArrayItems(state.custom) : generateArray(state.size, DEFAULT_PRESET);
}

export default function HomeView() {
  // 클라이언트 전용으로 렌더링되므로(HomePage 참고) 초기값에서 바로 URL과 난수를 쓸 수 있다
  const [state, setState] = useState<HomeState>(() => readState(window.location.search));
  const [input, setInput] = useState<ArrayItem[]>(() => initialInput(state));

  const update = (patch: Partial<HomeState>) => setState((s) => ({ ...s, ...patch }));

  // 상태 → URL (읽기는 마운트 시 한 번만 하므로 사용자가 만든 배열을 덮어쓰지 않는다)
  useEffect(() => {
    window.history.replaceState(null, "", `?${writeState(state)}`);
  }, [state]);

  const slotIds = useMemo(
    () => activeAlgorithmIds({ compare: state.compare, algorithms: state.algorithms }),
    [state.compare, state.algorithms]
  );
  const algorithms = useMemo(() => slotIds.map(getAlgorithm), [slotIds]);

  const slots = useMemo(
    () =>
      buildPlayerSlots({
        compare: state.compare,
        algorithms: state.algorithms,
        slotOptions: state.slotOptions,
      }),
    [state.compare, state.algorithms, state.slotOptions]
  );

  const player = useSortPlayer({ input, slots, speed: state.speed });
  const sound = useSortSound(player.views);

  const generate = (size: number, preset: PresetId) => {
    setInput(generateArray(size, preset));
    update({ size, preset, custom: null });
  };

  const applyCustom = (values: number[]) => {
    setInput(toArrayItems(values));
    update({ size: values.length, preset: "custom", custom: values });
  };

  const shuffle = () => {
    if (state.preset !== "custom") generate(state.size, state.preset);
    else if (state.custom) applyCustom(shuffleValues(state.custom));
    else generate(state.size, DEFAULT_PRESET);
  };

  const selectAlgorithm = (slot: Slot, id: AlgorithmId) => {
    const next: [AlgorithmId, AlgorithmId] = [...state.algorithms];
    next[slot] = id;
    update({ algorithms: next });
  };

  const changeSlotOptions = (slot: Slot, patch: Partial<AlgorithmOptionValues>) => {
    setState((s) => {
      const next: HomeState["slotOptions"] = [...s.slotOptions];
      next[slot] = { ...next[slot], ...patch };
      return { ...s, slotOptions: next };
    });
  };

  const canPlay = input.length >= MIN_ARRAY_SIZE;

  useKeyboardShortcuts({
    onToggle: () => canPlay && player.toggle(),
    onStepForward: () => canPlay && player.stepForward(),
    onStepBackward: () => canPlay && player.stepBackward(),
    onShuffle: shuffle,
    onToggleSound: sound.toggle,
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <header className="text-center flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
          Sorting Visualizer
        </h1>
        <p className="text-sm md:text-base text-indigo-100/50">
          {algorithms.map((a) => a.name).join(" vs ")} · 막대 {input.length}개
        </p>
      </header>

      <div className="sticky top-3 z-30 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl px-4 py-3">
        <PlaybackBar
          player={player}
          speed={state.speed}
          onSpeedChange={(speed) => update({ speed })}
          onShuffle={shuffle}
          disabled={!canPlay}
          extraControls={<SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />}
        />
      </div>

      <VisualizerStage
        views={player.views}
        input={input}
        algorithms={algorithms}
        options={slots.map((slot) => slot.options)}
        speed={state.speed}
        playing={player.status === "playing"}
        renderSlotControls={(slot) =>
          sound.enabled && (
            <SlotMuteButton
              slot={slot}
              name={algorithms[slot].name}
              muted={sound.isSlotMuted(slot)}
              onToggle={() => sound.toggleSlot(slot)}
            />
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] items-start">
        <Card className="flex flex-col gap-5">
          <AlgorithmPicker
            compareMode={state.compare}
            onCompareModeChange={(compare) => update({ compare })}
            selected={state.algorithms}
            onSelect={selectAlgorithm}
          />
          <AlgorithmOptions
            entries={slotIds.map((algorithmId, i) => ({
              slot: i as Slot,
              algorithmId,
              values: state.slotOptions[i],
            }))}
            onChange={changeSlotOptions}
          />
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <ArrayConfigurator
              size={input.length}
              preset={state.preset}
              onGenerate={generate}
              onCustom={applyCustom}
            />
          </Card>
          <Card className="flex flex-col gap-5">
            {algorithms.map((a, i) => (
              <AlgorithmInfoCard key={`${a.id}-${i}`} algorithm={a} accent={i === 0 ? "indigo" : "pink"} />
            ))}
          </Card>
        </div>
      </div>

      <footer className="text-center text-xs text-white/30 pb-4">
        단축키 · <kbd className="font-mono text-white/50">Space</kbd> 재생/일시정지 ·{" "}
        <kbd className="font-mono text-white/50">← →</kbd> 한 단계 · <kbd className="font-mono text-white/50">R</kbd> 새 배열 ·{" "}
        <kbd className="font-mono text-white/50">M</kbd> 소리
      </footer>
    </div>
  );
}
