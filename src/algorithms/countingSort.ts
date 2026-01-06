import { SortStep, ArrayItem } from "@/types/sort";

export function countingSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  if (arr.length === 0) return [];

  const a = [...arr];
  const max = Math.max(...a.map((x) => x.value));
  const min = Math.min(...a.map((x) => x.value));
  const range = max - min + 1;

  const count = new Array(range).fill(0);
  for (let i = 0; i < a.length; i++) {
    count[a[i].value - min]++;
    steps.push({ array: [...a], compare: [i, i] });
  }

  const sortedValues: number[] = [];
  for (let i = 0; i < range; i++) {
    while (count[i] > 0) {
      sortedValues.push(i + min);
      count[i]--;
    }
  }

  // Swap original items into their sorted positions based on value
  for (let i = 0; i < sortedValues.length; i++) {
    const targetValue = sortedValues[i];
    // Find an item that hasn't been placed yet and has the target value
    const currentIdx = a.findIndex(
      (item, idx) => idx >= i && item.value === targetValue
    );
    if (currentIdx !== -1 && currentIdx !== i) {
      [a[i], a[currentIdx]] = [a[currentIdx], a[i]];
      steps.push({ array: [...a], swap: [i, currentIdx] });
    }
  }

  return steps;
}
