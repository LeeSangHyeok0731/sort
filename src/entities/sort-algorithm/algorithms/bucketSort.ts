import type { ArrayItem } from "@/shared/model";
import type { SortAlgorithm } from "../model/types";
import { insertionSortRange } from "./insertionSort";
import { ALGO_CODE } from "./code";

export const bucketSort: SortAlgorithm = {
  id: "bucket",
  name: "버킷 정렬",
  category: "linear",
  desc: "범위별 버킷에 담아 정렬",
  complexity: {
    best: "O(n + k)",
    average: "O(n + k)",
    worst: "O(n²)",
    space: "O(n + k)",
  },
  stable: true,
  code: ALGO_CODE.bucket,
  sort(t, { bucketCount }) {
    const n = t.length;
    if (n < 2) return;

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      min = Math.min(min, t.value(i));
      max = Math.max(max, t.value(i));
    }

    const k = Math.max(1, Math.floor(bucketCount ?? Math.sqrt(n)));
    const buckets: ArrayItem[][] = Array.from({ length: k }, () => []);
    for (let i = 0; i < n; i++) {
      t.mark(i);
      const b = Math.min(k - 1, Math.floor(((t.value(i) - min) / (max - min || 1)) * k));
      buckets[b].push(t.item(i));
    }

    // 버킷 순서대로 모은 뒤, 각 버킷 구간을 삽입 정렬
    t.arrange(0, buckets.flat());
    let start = 0;
    for (const bucket of buckets) {
      insertionSortRange(t, start, start + bucket.length - 1);
      start += bucket.length;
    }
  },
};
