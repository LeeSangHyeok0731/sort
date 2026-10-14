import { getAlgorithm, type AlgorithmId } from "@/entities/sort-algorithm";
import type { PlayerSlot } from "@/features/playback";
import { parseGaps, type HomeState } from "./urlState";

/** 화면에 표시할 슬롯의 알고리즘 id (비교 모드가 아니면 1번만) */
export function activeAlgorithmIds(state: Pick<HomeState, "compare" | "algorithms">): AlgorithmId[] {
  return state.compare ? [...state.algorithms] : [state.algorithms[0]];
}

/**
 * 재생기에 넘길 슬롯 구성을 만든다.
 * 슬롯마다 자기 옵션만 사용하므로 같은 알고리즘을 옵션만 바꿔 비교할 수 있다.
 */
export function buildPlayerSlots(
  state: Pick<HomeState, "compare" | "algorithms" | "slotOptions">
): PlayerSlot[] {
  return activeAlgorithmIds(state).map((id, i) => {
    const values = state.slotOptions[i];
    return {
      algorithm: getAlgorithm(id),
      options: { shellGaps: parseGaps(values.shellGaps), bucketCount: values.bucketCount },
    };
  });
}
