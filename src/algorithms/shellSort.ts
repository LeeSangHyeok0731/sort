import { SortStep, ArrayItem } from "@/types/sort";

export function shellSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  const n = a.length;

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let j = i;
      while (j >= gap) {
        steps.push({ array: [...a], compare: [j - gap, j] });
        if (a[j - gap].value > a[j].value) {
          [a[j], a[j - gap]] = [a[j - gap], a[j]];
          steps.push({ array: [...a], swap: [j, j - gap] });
          j -= gap;
        } else {
          break;
        }
      }
    }
  }

  // Ensure the final sorted state is recorded
  steps.push({ array: [...a] });
  return steps;
}
