import { SortStep, ArrayItem } from "@/types/sort";

export function selectionSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      steps.push({
        array: [...a],
        compare: [minIdx, j],
      });
      if (a[j].value < a[minIdx].value) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({
        array: [...a],
        swap: [i, minIdx],
      });
    }
  }

  return steps;
}
