import { describe, expect, it } from "vitest";
import { resolveShortcut, type ShortcutKeyInput } from "./shortcutKey";

const KEYS = [" ", "ArrowRight", "ArrowLeft", "r", "R", "m", "M"] as const;

function on(target: Omit<ShortcutKeyInput, "key">) {
  return (key: string) => resolveShortcut({ key, ...target });
}

describe("resolveShortcut: 포커스 없음(body·window)", () => {
  const press = on({ tagName: null });

  it("각 키를 동작으로 바꾼다", () => {
    expect(press(" ")).toEqual({ action: "toggle", preventDefault: true });
    expect(press("ArrowRight")).toEqual({ action: "stepForward", preventDefault: true });
    expect(press("ArrowLeft")).toEqual({ action: "stepBackward", preventDefault: true });
    expect(press("r")).toEqual({ action: "shuffle", preventDefault: false });
    expect(press("R")).toEqual({ action: "shuffle", preventDefault: false });
    expect(press("m")).toEqual({ action: "toggleSound", preventDefault: false });
    expect(press("M")).toEqual({ action: "toggleSound", preventDefault: false });
  });

  it("BODY·DIV도 같다", () => {
    expect(on({ tagName: "BODY" })(" ")?.action).toBe("toggle");
    expect(on({ tagName: "DIV" })("ArrowLeft")?.action).toBe("stepBackward");
  });

  it("단축키가 아닌 키는 null", () => {
    for (const key of ["Enter", "Tab", "ArrowUp", "ArrowDown", "a", "Escape", "Spacebar"]) {
      expect(press(key)).toBeNull();
    }
  });

  it("Ctrl·Meta·Alt가 눌려 있으면 모두 건너뛴다", () => {
    for (const key of KEYS) {
      expect(resolveShortcut({ key, ctrlKey: true })).toBeNull();
      expect(resolveShortcut({ key, metaKey: true })).toBeNull();
      expect(resolveShortcut({ key, altKey: true })).toBeNull();
    }
  });
});

describe("resolveShortcut: 글자 입력 요소는 모두 건너뛴다", () => {
  const typingTargets: Omit<ShortcutKeyInput, "key">[] = [
    { tagName: "TEXTAREA" },
    { tagName: "SELECT" },
    { tagName: "DIV", isContentEditable: true },
    { tagName: "INPUT", inputType: "text" },
    { tagName: "INPUT", inputType: "number" },
    { tagName: "INPUT", inputType: "search" },
    { tagName: "INPUT", inputType: "email" },
    { tagName: "INPUT", inputType: "url" },
    { tagName: "INPUT", inputType: "password" },
    { tagName: "INPUT", inputType: "tel" },
    { tagName: "INPUT", inputType: "date" },
    { tagName: "INPUT", inputType: "time" },
    // type이 없거나 모르는 값이면 text로 본다
    { tagName: "INPUT" },
    { tagName: "INPUT", inputType: null },
    { tagName: "INPUT", inputType: "unknown" },
    // 태그 이름 대소문자는 가리지 않는다
    { tagName: "input", inputType: "TEXT" },
  ];

  for (const target of typingTargets) {
    it(`${target.tagName} ${target.inputType ?? ""}${target.isContentEditable ? " contentEditable" : ""}`, () => {
      for (const key of KEYS) expect(resolveShortcut({ key, ...target })).toBeNull();
    });
  }
});

describe("resolveShortcut: range·radio는 화살표만 요소에 맡긴다", () => {
  for (const inputType of ["range", "radio", "RANGE"]) {
    const press = on({ tagName: "INPUT", inputType });

    it(`${inputType}: Space·R·M은 단축키`, () => {
      expect(press(" ")).toEqual({ action: "toggle", preventDefault: true });
      expect(press("r")?.action).toBe("shuffle");
      expect(press("M")?.action).toBe("toggleSound");
    });

    it(`${inputType}: 화살표는 null (값 이동은 기본 동작)`, () => {
      expect(press("ArrowRight")).toBeNull();
      expect(press("ArrowLeft")).toBeNull();
    });
  }
});

describe("resolveShortcut: 버튼류는 모든 단축키를 처리하고 Space 클릭·토글을 막는다", () => {
  const buttonTargets: Omit<ShortcutKeyInput, "key">[] = [
    { tagName: "BUTTON" },
    { tagName: "A" },
    { tagName: "INPUT", inputType: "checkbox" },
    { tagName: "INPUT", inputType: "button" },
    { tagName: "INPUT", inputType: "submit" },
    { tagName: "INPUT", inputType: "reset" },
  ];

  for (const target of buttonTargets) {
    it(`${target.tagName} ${target.inputType ?? ""}`, () => {
      const press = on(target);
      expect(press(" ")).toEqual({ action: "toggle", preventDefault: true });
      expect(press("ArrowRight")).toEqual({ action: "stepForward", preventDefault: true });
      expect(press("ArrowLeft")).toEqual({ action: "stepBackward", preventDefault: true });
      expect(press("R")?.action).toBe("shuffle");
      expect(press("m")?.action).toBe("toggleSound");
    });
  }

  it("isContentEditable가 우선한다", () => {
    expect(resolveShortcut({ key: " ", tagName: "BUTTON", isContentEditable: true })).toBeNull();
  });
});
