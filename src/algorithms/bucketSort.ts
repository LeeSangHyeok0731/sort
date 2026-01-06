import { SortStep, ArrayItem } from "@/types/sort";

export function bucketSortSteps(
  arr: ArrayItem[],
  customBucketCount?: number
): SortStep[] {
  const steps: SortStep[] = [];
  if (arr.length === 0) return [];

  const a = [...arr];
  const n = a.length;
  const max = Math.max(...a.map((x) => x.value));
  const min = Math.min(...a.map((x) => x.value));

  const bucketCount = customBucketCount || Math.floor(Math.sqrt(n)) || 1;
  const buckets: ArrayItem[][] = Array.from(
    { length: bucketCount + 1 },
    () => []
  );

  for (let i = 0; i < n; i++) {
    const bucketIndex = Math.floor(
      ((a[i].value - min) / (max - min || 1)) * bucketCount
    );
    const safeIndex = Math.min(bucketIndex, bucketCount);
    buckets[safeIndex].push(a[i]);
    steps.push({ array: [...a], compare: [i, i] });
  }

  const flatResult: ArrayItem[] = [];
  for (let i = 0; i <= bucketCount; i++) {
    buckets[i].sort((a, b) => a.value - b.value);
    flatResult.push(...buckets[i]);
  }

  for (let i = 0; i < flatResult.length; i++) {
    const targetItem = flatResult[i];
    const currentIdx = a.findIndex((item) => item.id === targetItem.id);
    if (currentIdx !== -1 && currentIdx !== i) {
      [a[i], a[currentIdx]] = [a[currentIdx], a[i]];
      steps.push({ array: [...a], swap: [i, currentIdx] });
    }
  }

  return steps;
}
