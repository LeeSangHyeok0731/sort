/**
 * 원소를 여러 칸(더미·버킷·값·자릿수)에 나눠 담는 정렬들의 칸 상태를 재생 정보로 다시 계산한다.
 * 버킷·계수·기수 정렬은 칸에서 꺼낼 때 같은 칸 안의 순서를 지키므로(안정),
 * "지금 배열을 앞에서부터 칸에 담은 것"이 언제나 그 정렬의 칸 상태와 같다.
 */

import type { ArrayItem } from "@/shared/model";

// ───────────── 페이션스 더미 ─────────────

/** i번째 카드가 올라갈 더미 번호: 맨 위 카드가 자기 이상인 가장 왼쪽 더미 (이분 탐색) */
export function pileFor(values: readonly number[], piles: readonly number[][], i: number) {
  let lo = 0;
  let hi = piles.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    const top = piles[mid][piles[mid].length - 1];
    if (values[top] >= values[i]) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

/** 입력 0..count-1을 페이션스 규칙으로 나눈 더미 (입력 인덱스, 아래 → 위) */
export function patiencePiles(values: readonly number[], count: number): number[][] {
  const piles: number[][] = [];
  for (let i = 0; i < count; i++) {
    const p = pileFor(values, piles, i);
    if (p === piles.length) piles.push([]);
    piles[p].push(i);
  }
  return piles;
}

// ───────────── 칸 나누기 ─────────────

export type BinRule = {
  /** 칸 수 */
  k: number;
  /** 값 → 칸 번호 */
  of: (value: number) => number;
  /** 칸 이름 */
  labels: string[];
};

/** 버킷 정렬과 같은 규칙: 값 범위를 k칸으로 똑같이 나눈다 */
export function bucketRule(values: readonly number[], bucketCount: number | undefined): BinRule {
  const n = values.length;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  const k = Math.max(1, Math.floor(bucketCount ?? Math.sqrt(n)));
  const span = max - min || 1;
  const of = (v: number) => Math.min(k - 1, Math.floor(((v - min) / span) * k));
  const labels = Array.from({ length: k }, (_, b) => (n === 0 ? "" : String(Math.ceil(min + (span * b) / k))));
  return { k, of, labels };
}

/** 계수 정렬: 값마다 한 칸. 범위가 maxColumns보다 넓으면 같은 폭의 구간으로 묶는다 */
export function countingRule(values: readonly number[], maxColumns = 40): BinRule {
  if (values.length === 0) return { k: 0, of: () => 0, labels: [] };
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  const width = Math.ceil((max - min + 1) / maxColumns);
  const k = Math.floor((max - min) / width) + 1;
  const labels = Array.from({ length: k }, (_, b) => String(min + b * width));
  return { k, of: (v) => Math.floor((v - min) / width), labels };
}

/** 기수 정렬: pass번째 자릿수(0 = 1의 자리)로 10칸 */
export function radixRule(pass: number): BinRule {
  const exp = 10 ** pass;
  return { k: 10, of: (v) => Math.floor(v / exp) % 10, labels: Array.from({ length: 10 }, (_, d) => String(d)) };
}

/** 원소 앞 count개를 규칙대로 칸에 담는다 (칸마다 아래 → 위, 배열 순서대로) */
export function fillBins(items: readonly ArrayItem[], count: number, rule: BinRule): ArrayItem[][] {
  const columns: ArrayItem[][] = Array.from({ length: rule.k }, () => []);
  for (let i = 0; i < count; i++) columns[rule.of(items[i].value)].push(items[i]);
  return columns;
}

// ───────────── 기수 진행 ─────────────

/** 기수 정렬의 자릿수 개수 (정렬 구현과 같은 반복 조건) */
export function radixPasses(maxValue: number) {
  let passes = 0;
  for (let exp = 1; Math.floor(maxValue / exp) > 0; exp *= 10) passes++;
  return passes;
}

/** 읽기 표식이 실행된 횟수로 지금 몇 번째 자릿수인지 (자릿수마다 n번 읽는다) */
export function radixPass(n: number, reads: number, passes: number) {
  if (n === 0 || passes === 0) return 0;
  return Math.min(passes - 1, Math.max(0, Math.ceil(reads / n) - 1));
}
