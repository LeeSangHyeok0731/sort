import { describe, expect, it } from "vitest";
import { resolveTheme, THEME_INIT_SCRIPT } from "./theme";

describe("resolveTheme", () => {
  it("저장된 값이 있으면 OS 설정보다 우선한다", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("저장된 값이 없으면 OS 설정을 따른다", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("알 수 없는 저장 값은 무시한다", () => {
    expect(resolveTheme("blue", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});

describe("THEME_INIT_SCRIPT", () => {
  /** 스크립트를 가짜 브라우저 전역으로 실행하고 정해진 data-theme를 돌려준다 */
  function run(stored: string | null, prefersDark: boolean, storageThrows = false): string | undefined {
    const root = { dataset: {} as Record<string, string> };
    const localStorage = {
      getItem: () => {
        if (storageThrows) throw new Error("blocked");
        return stored;
      },
    };
    const matchMedia = () => ({ matches: prefersDark });
    new Function("localStorage", "matchMedia", "document", THEME_INIT_SCRIPT)(
      localStorage,
      matchMedia,
      { documentElement: root }
    );
    return root.dataset.theme;
  }

  it.each([
    ["light", true],
    ["dark", false],
    [null, true],
    [null, false],
    ["blue", true],
  ] as const)("저장 %s, OS 다크 %s → resolveTheme와 같은 결과", (stored, prefersDark) => {
    expect(run(stored, prefersDark)).toBe(resolveTheme(stored, prefersDark));
  });

  it("localStorage가 막혀 있어도 OS 설정으로 정한다", () => {
    expect(run(null, true, true)).toBe("dark");
  });
});
