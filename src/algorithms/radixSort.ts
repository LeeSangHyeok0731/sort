import { SortStep, ArrayItem } from "@/types/sort";

export function radixSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  if (arr.length === 0) return [];

  const a = [...arr];
  const max = Math.max(...a.map((x) => x.value));

  function countingSortForRadix(exp: number) {
    const output = new Array(a.length);
    const count = new Array(10).fill(0);

    for (let i = 0; i < a.length; i++) {
      count[Math.floor(a[i].value / exp) % 10]++;
      steps.push({ array: [...a], compare: [i, i] });
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    for (let i = a.length - 1; i >= 0; i--) {
      const digit = Math.floor(a[i].value / exp) % 10;
      output[count[digit] - 1] = a[i];
      count[digit]--;
    }

    // Instead of simple replacement, use swap-based placement to keep IDs unique in the array
    for (let i = 0; i < a.length; i++) {
      const targetItem = output[i];
      const currentIdx = a.findIndex((item) => item.id === targetItem.id);
      if (currentIdx !== -1 && currentIdx !== i) {
        [a[i], a[currentIdx]] = [a[currentIdx], a[i]];
        steps.push({ array: [...a], swap: [i, currentIdx] });
      }
    }
  }

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortForRadix(exp);
  }

  return steps;
}
