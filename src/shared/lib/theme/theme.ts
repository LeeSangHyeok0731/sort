export type Theme = "light" | "dark";

/** localStorage 키. 값은 "light" | "dark" */
export const THEME_STORAGE_KEY = "theme";

/** 저장된 선택이 있으면 그것을, 없으면 OS 설정을 따른다 */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

/** 지금 화면에 적용된 테마 (<html data-theme>) */
export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** 테마를 바꾸고 선택을 기억한다 */
export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // 저장이 막혀 있으면 이번 방문 동안만 적용
  }
}

/**
 * <head>에서 화면을 그리기 전에 실행해 밝은 화면이 번쩍이지 않게 한다.
 * resolveTheme와 같은 규칙이어야 한다 (theme.test.ts가 확인).
 */
export const THEME_INIT_SCRIPT = `(function(){var s=null;try{s=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"})()`;
