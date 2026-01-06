import { SortStep, ArrayItem } from "@/types/sort";

export function oddEvenSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let sorted = false;

  while (!sorted) {
    sorted = true;

    // Odd phase
    for (let i = 1; i < a.length - 1; i += 2) {
      steps.push({ array: [...a], compare: [i, i + 1] });
      if (a[i].value > a[i + 1].value) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        steps.push({ array: [...a], swap: [i, i + 1] });
        sorted = false;
      }
    }

    // Even phase
    for (let i = 0; i < a.length - 1; i += 2) {
      steps.push({ array: [...a], compare: [i, i + 1] });
      if (a[i].value > a[i + 1].value) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        steps.push({ array: [...a], swap: [i, i + 1] });
        sorted = false;
      }
    }
  }

  steps.push({ array: [...a] });
  return steps;
}
