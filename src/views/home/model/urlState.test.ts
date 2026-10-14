import { describe, expect, it } from "vitest";
import { DEFAULT_STATE, parseGaps, readState, writeState, type HomeState } from "./urlState";

describe("readState", () => {
  it("빈 쿼리는 기본 상태", () => {
    expect(readState("")).toEqual(DEFAULT_STATE);
  });

  it("잘못된 값은 기본값으로 대체하고 범위를 보정한다", () => {
    const state = readState("?algo=nope&speed=3&size=5000&preset=zzz&buckets=99");
    expect(state.algorithms[0]).toBe("bubble");
    expect(state.speed).toBe(2); // 가장 가까운 배속 (2와 4 중 2)
    expect(state.size).toBe(1000);
    expect(state.preset).toBe("shuffled");
    expect(state.bucketCount).toBe(20);
  });

  it("size=1은 2로 보정한다 (기존 덮어쓰기 버그의 원인)", () => {
    expect(readState("?size=1").size).toBe(2);
  });

  it("data가 있으면 커스텀 배열로 해석하고 size를 맞춘다", () => {
    const state = readState("?data=5,3,9&size=20");
    expect(state.preset).toBe("custom");
    expect(state.custom).toEqual([5, 3, 9]);
    expect(state.size).toBe(3);
  });

  it("잘못된 data는 무시한다", () => {
    expect(readState("?data=-1,abc").preset).toBe("shuffled");
  });
});

describe("writeState", () => {
  it("읽고 쓰면 같은 상태가 된다", () => {
    const state: HomeState = {
      algorithms: ["merge", "heap"],
      compare: true,
      speed: 64,
      size: 3,
      preset: "custom",
      custom: [3, 1, 2],
      shellGaps: "",
      bucketCount: 8,
    };
    expect(readState(writeState(state))).toEqual(state);
  });

  it("비교 모드가 아니면 algo2를 쓰지 않는다", () => {
    const query = writeState({ ...DEFAULT_STATE, algorithms: ["tim", "heap"] });
    expect(query).not.toContain("algo2");
    expect(query).toContain("algo=tim");
  });
});

describe("parseGaps", () => {
  it("양의 정수만 남긴다", () => {
    expect(parseGaps("701, 301 x 0 -4 2.5 1")).toEqual([701, 301, 1]);
  });
});
