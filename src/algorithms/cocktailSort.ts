import { SortStep, ArrayItem } from "@/types/sort";

export function cocktailSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let swapped = true;
  let start = 0;
  let end = a.length - 1;

  while (swapped) {
    swapped = false;

    // Forward pass
    for (let i = start; i < end; i++) {
      steps.push({ array: [...a], compare: [i, i + 1] });
      if (a[i].value > a[i + 1].value) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        steps.push({ array: [...a], swap: [i, i + 1] });
        swapped = true;
      }
    }

    if (!swapped) break;

    swapped = false;
    end--;

    // Backward pass
    for (let i = end - 1; i >= start; i--) {
      steps.push({ array: [...a], compare: [i, i + 1] });
      if (a[i].value > a[i + 1].value) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        steps.push({ array: [...a], swap: [i, i + 1] });
        swapped = true;
      }
    }

    start++;
  }

  steps.push({ array: [...a] });
  return steps;
}
