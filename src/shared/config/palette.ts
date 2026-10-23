/**
 * canvas에서 쓰는 색. 밝은 값은 globals.css의 @theme, 어두운 값은 :root[data-theme="dark"]와
 * 같아야 한다 (palette.test.ts가 확인).
 * DOM 요소는 이 값을 직접 쓰지 말고 bg-surface, text-muted 같은 토큰 클래스를 쓴다.
 */
export const PALETTE = {
  light: {
    background: "#ffffff",
    surface: "#ffffff",
    subtle: "#f9fafb",
    line: "#e5e7eb",
    lineStrong: "#cbd5e1",
    foreground: "#111827",
    muted: "#6b7280",
    faint: "#9ca3af",
    /** 막대·노드 상태색 */
    tone: {
      idle: "#94a3b8",
      compare: "#f59e0b",
      change: "#ef4444",
      read: "#0ea5e9",
      done: "#10b981",
    },
    /** 비교 모드 슬롯 색 (1번, 2번) */
    slot: ["#2563eb", "#7c3aed"],
  },
  dark: {
    background: "#0d1117",
    surface: "#161b22",
    subtle: "#1c2128",
    line: "#30363d",
    lineStrong: "#484f58",
    foreground: "#e6edf3",
    muted: "#8b949e",
    faint: "#6e7681",
    tone: {
      idle: "#6e7681",
      compare: "#fbbf24",
      change: "#f87171",
      read: "#38bdf8",
      done: "#34d399",
    },
    slot: ["#60a5fa", "#a78bfa"],
  },
} as const;
