import { SortStep, ArrayItem } from "@/types/sort";

export function combSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let gap = a.length;
  const shrink = 1.3;
  let sorted = false;

  while (!sorted) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }

    for (let i = 0; i + gap < a.length; i++) {
      steps.push({ array: [...a], compare: [i, i + gap] });
      if (a[i].value > a[i + gap].value) {
        [a[i], a[i + gap]] = [a[i + gap], a[i]];
        steps.push({ array: [...a], swap: [i, i + gap] });
        sorted = false;
      }
    }
  }

  steps.push({ array: [...a] });
  return steps;
}
