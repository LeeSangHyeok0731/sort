/**
 * canvas에서 쓰는 색. globals.css의 @theme 토큰과 값이 같아야 한다 (palette.test.ts가 확인).
 * DOM 요소는 이 값을 직접 쓰지 말고 bg-surface, text-muted 같은 토큰 클래스를 쓴다.
 */
export const PALETTE = {
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
} as const;
