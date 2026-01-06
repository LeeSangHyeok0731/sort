import { SortStep, ArrayItem } from "@/types/sort";

export function insertionSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      steps.push({
        array: [...a],
        compare: [j - 1, j],
      });
      if (a[j].value < a[j - 1].value) {
        [a[j], a[j - 1]] = [a[j - 1], a[j]];
        steps.push({
          array: [...a],
          swap: [j - 1, j],
        });
        j--;
      } else {
        break;
      }
    }
  }

  return steps;
}
