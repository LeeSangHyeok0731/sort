import { describe, expect, it } from "vitest";
import { MAX_ARRAY_SIZE, PRESETS } from "../model/constants";
import { clampSize, generateValues, toArrayItems } from "./generate";
import { parseCustomValues, parseSize } from "./parse";

describe("generateValues", () => {
  it.each(PRESETS.map((p) => p.id))("%s 프리셋은 요청한 크기의 양수 배열을 만든다", (preset) => {
    const values = generateValues(50, preset);
    expect(values).toHaveLength(50);
    expect(values.every((v) => Number.isInteger(v) && v > 0)).toBe(true);
  });

  it("shuffled는 1~n 순열이다", () => {
    const values = generateValues(30, "shuffled");
    expect([...values].sort((a, b) => a - b)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it("reversed는 내림차순이다", () => {
    expect(generateValues(5, "reversed")).toEqual([5, 4, 3, 2, 1]);
  });

  it("nearlySorted는 정렬된 상태에서 조금만 어긋난다", () => {
    const values = generateValues(100, "nearlySorted");
    const outOfPlace = values.filter((v, i) => v !== i + 1).length;
    expect(outOfPlace).toBeLessThanOrEqual(10);
  });

  it("fewUnique는 값이 최대 5종류다", () => {
    expect(new Set(generateValues(200, "fewUnique")).size).toBeLessThanOrEqual(5);
  });

  it("크기는 2~1000으로 보정한다", () => {
    expect(clampSize(1)).toBe(2);
    expect(clampSize(5000)).toBe(MAX_ARRAY_SIZE);
    expect(clampSize(NaN)).toBe(2);
    expect(generateValues(0, "shuffled")).toHaveLength(2);
  });
});

describe("toArrayItems", () => {
  it("호출할 때마다 겹치지 않는 id를 부여한다", () => {
    const a = toArrayItems([1, 2, 3]);
    const b = toArrayItems([1, 2, 3]);
    const ids = new Set([...a, ...b].map((x) => x.id));
    expect(ids.size).toBe(6);
  });
});

describe("parseCustomValues", () => {
  it("쉼표와 공백을 모두 구분자로 쓴다", () => {
    expect(parseCustomValues("10, 50 20,,80\n3")).toEqual({ ok: true, values: [10, 50, 20, 80, 3] });
  });

  it("0은 허용한다", () => {
    expect(parseCustomValues("0 1")).toEqual({ ok: true, values: [0, 1] });
  });

  it.each([
    ["5", "2개 이상"],
    ["-5, 3", "정수가 아니"],
    ["1.5, 3", "정수가 아니"],
    ["abc, 3", "정수가 아니"],
    ["10000, 3", "9999 이하"],
  ])("%s → 오류", (input, message) => {
    const result = parseCustomValues(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(message);
  });

  it("1000개를 넘으면 오류", () => {
    const result = parseCustomValues(Array(1001).fill(1).join(","));
    expect(result.ok).toBe(false);
  });
});

describe("parseSize", () => {
  it("숫자만 허용한다", () => {
    expect(parseSize(" 42 ")).toBe(42);
    expect(parseSize("")).toBeNull();
    expect(parseSize("4a")).toBeNull();
  });
});
