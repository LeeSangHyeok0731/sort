/** 가장 낮은 값과 가장 높은 값의 음 높이 (Hz) */
export const MIN_FREQUENCY = 120;
export const MAX_FREQUENCY = 1200;

/**
 * 막대 값을 음 높이로 바꾼다.
 * 사람 귀는 주파수를 로그로 느끼므로, 값이 같은 비율로 커지면 같은 음정만큼 올라가게 한다.
 */
export function valueToFrequency(value: number, maxValue: number): number {
  const ratio = maxValue > 0 ? Math.min(1, Math.max(0, value / maxValue)) : 0;
  return MIN_FREQUENCY * Math.pow(MAX_FREQUENCY / MIN_FREQUENCY, ratio);
}

/** 완료 효과: 정렬된 값들을 따라 올라가는 음을 최대 maxNotes개까지 고르게 뽑는다 */
export function sweepFrequencies(sortedValues: readonly number[], maxValue: number, maxNotes: number): number[] {
  const n = sortedValues.length;
  if (n === 0) return [];
  const count = Math.min(n, maxNotes);
  return Array.from({ length: count }, (_, k) => {
    const index = count === 1 ? n - 1 : Math.round((k * (n - 1)) / (count - 1));
    return valueToFrequency(sortedValues[index], maxValue);
  });
}
