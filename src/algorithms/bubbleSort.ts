import { SortStep, ArrayItem } from "@/types/sort";

export function bubbleSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({
        array: [...a],
        compare: [j, j + 1],
      });

      if (a[j].value > a[j + 1].value) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: [...a],
          swap: [j, j + 1],
        });
      }
    }
  }

  return steps;
}
