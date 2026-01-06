import { SortStep, ArrayItem } from "@/types/sort";

export function shellSortSteps(
  arr: ArrayItem[],
  customGaps?: number[]
): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  const n = a.length;

  // Use custom gaps or default n/2 sequence
  const gaps =
    customGaps && customGaps.length > 0
      ? customGaps.filter((g) => g > 0 && g < n)
      : [];

  if (gaps.length === 0) {
    for (let g = Math.floor(n / 2); g > 0; g = Math.floor(g / 2)) {
      gaps.push(g);
    }
  }

  for (const gap of gaps) {
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

  steps.push({ array: [...a] });
  return steps;
}
