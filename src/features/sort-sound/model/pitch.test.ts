import { describe, expect, it } from "vitest";
import { MAX_FREQUENCY, MIN_FREQUENCY, valueToFrequency, sweepFrequencies } from "./pitch";

describe("valueToFrequency", () => {
  it("최솟값은 가장 낮은 음, 최댓값은 가장 높은 음", () => {
    expect(valueToFrequency(0, 100)).toBeCloseTo(MIN_FREQUENCY);
    expect(valueToFrequency(100, 100)).toBeCloseTo(MAX_FREQUENCY);
  });

  it("값이 클수록 음이 높다 (단조 증가)", () => {
    const freqs = [0, 10, 25, 50, 75, 100].map((v) => valueToFrequency(v, 100));
    for (let i = 1; i < freqs.length; i++) expect(freqs[i]).toBeGreaterThan(freqs[i - 1]);
  });

  it("귀에 고르게 들리도록 로그 스케일: 중간값은 두 끝의 기하 평균", () => {
    expect(valueToFrequency(50, 100)).toBeCloseTo(Math.sqrt(MIN_FREQUENCY * MAX_FREQUENCY));
  });

  it("범위를 벗어나거나 최댓값이 0이어도 안전하다", () => {
    expect(valueToFrequency(-5, 100)).toBeCloseTo(MIN_FREQUENCY);
    expect(valueToFrequency(500, 100)).toBeCloseTo(MAX_FREQUENCY);
    expect(valueToFrequency(0, 0)).toBeCloseTo(MIN_FREQUENCY);
  });
});

describe("sweepFrequencies", () => {
  it("정렬된 값들을 따라 올라가는 음을 최대 개수만큼 고르게 뽑는다", () => {
    const values = Array.from({ length: 1000 }, (_, i) => i + 1);
    const freqs = sweepFrequencies(values, 1000, 40);
    expect(freqs).toHaveLength(40);
    for (let i = 1; i < freqs.length; i++) expect(freqs[i]).toBeGreaterThanOrEqual(freqs[i - 1]);
    expect(freqs.at(-1)).toBeCloseTo(MAX_FREQUENCY);
  });

  it("원소가 적으면 원소 수만큼", () => {
    expect(sweepFrequencies([1, 2, 3], 3, 40)).toHaveLength(3);
    expect(sweepFrequencies([], 0, 40)).toHaveLength(0);
  });
});
