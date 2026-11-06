import { describe, expect, it } from "vitest";
import { describeSortError, resolvePlayerStatus } from "./playerStatus";

const base = { ready: false, computing: false, failed: false, active: false, allDone: false };

describe("resolvePlayerStatus", () => {
  it("준비 전이고 아무 일도 없으면 idle", () => {
    expect(resolvePlayerStatus(base)).toBe("idle");
  });

  it("준비 전에 계산 중이면 computing", () => {
    expect(resolvePlayerStatus({ ...base, computing: true })).toBe("computing");
  });

  it("준비 전에 계산이 실패했으면 error", () => {
    expect(resolvePlayerStatus({ ...base, failed: true })).toBe("error");
  });

  it("다시 시도해 계산 중이면 실패보다 computing이 먼저다", () => {
    expect(resolvePlayerStatus({ ...base, computing: true, failed: true })).toBe("computing");
  });

  it("준비된 뒤에는 재생 중·완료·일시정지로 나뉜다", () => {
    expect(resolvePlayerStatus({ ...base, ready: true, active: true })).toBe("playing");
    expect(resolvePlayerStatus({ ...base, ready: true, allDone: true })).toBe("done");
    expect(resolvePlayerStatus({ ...base, ready: true })).toBe("paused");
  });

  it("준비된 트랙이 있으면 실패 표시는 무시한다", () => {
    expect(resolvePlayerStatus({ ...base, ready: true, failed: true })).toBe("paused");
  });
});

describe("describeSortError", () => {
  it("Error의 메시지를 담는다", () => {
    expect(describeSortError(new Error("Unknown algorithm: nope"))).toBe(
      "정렬 계산에 실패했습니다: Unknown algorithm: nope"
    );
  });

  it("워커가 문자열로 보낸 Error: 접두어를 뗀다", () => {
    expect(describeSortError(new Error("Error: 범위를 벗어남"))).toBe("정렬 계산에 실패했습니다: 범위를 벗어남");
    expect(describeSortError("TypeError: x is undefined")).toBe("정렬 계산에 실패했습니다: x is undefined");
  });

  it("내용이 없으면 알 수 없는 오류로 쓴다", () => {
    expect(describeSortError(new Error(""))).toBe("정렬 계산에 실패했습니다: 알 수 없는 오류");
    expect(describeSortError(undefined)).toBe("정렬 계산에 실패했습니다: 알 수 없는 오류");
    expect(describeSortError({ code: 1 })).toBe("정렬 계산에 실패했습니다: 알 수 없는 오류");
  });

  it("너무 긴 메시지는 자른다", () => {
    const message = describeSortError(new Error("가".repeat(500)));
    expect(message.length).toBeLessThan(160);
    expect(message.endsWith("…")).toBe(true);
  });
});
