import { SortStep, ArrayItem } from "@/types/sort";

export function gnomeSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let index = 0;

  while (index < a.length) {
    if (index === 0) index++;
    steps.push({ array: [...a], compare: [index, index - 1] });
    if (a[index].value >= a[index - 1].value) {
      index++;
    } else {
      [a[index], a[index - 1]] = [a[index - 1], a[index]];
      steps.push({ array: [...a], swap: [index, index - 1] });
      index--;
    }
  }

  steps.push({ array: [...a] });
  return steps;
}
