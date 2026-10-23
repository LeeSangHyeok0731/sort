# 밝은 테마(C1) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 어두운 남색·그라데이션·유리 카드 디자인을 흰 바탕 + 얇은 테두리의 밝은 테마 하나로 바꾼다.

**Architecture:** `globals.css`의 `@theme`에 의미 색 토큰을 정의해 Tailwind 클래스(`bg-surface`, `text-muted` …)로 쓰고, canvas용으로 같은 값을 `src/shared/config/palette.ts`에 둔다. 두 곳의 값이 같은지 테스트로 묶는다. 각 컴포넌트의 어두운 테마용 클래스를 토큰 클래스로 바꾸고, 마지막에 어두운 클래스가 남지 않았는지 검사하는 테스트를 둔다.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (`@theme`), Prism.js, Vitest.

설계 문서: `docs/superpowers/specs/2026-10-23-light-theme-design.md`

## Global Constraints

- 레이아웃·크기·애니메이션·기능은 바꾸지 않는다. 색·테두리·그림자·모서리만 바꾼다.
- 다크 모드 없음. 모바일 점검 없음.
- 토큰 값 (CSS와 `palette.ts`가 똑같아야 함):
  `background #ffffff`, `surface #ffffff`, `subtle #f9fafb`, `line #e5e7eb`, `line-strong #cbd5e1`, `foreground #111827`, `muted #6b7280`, `faint #9ca3af`,
  `tone-idle #94a3b8`, `tone-compare #f59e0b`, `tone-change #ef4444`, `tone-read #0ea5e9`, `tone-done #10b981`, `slot-1 #2563eb`, `slot-2 #7c3aed`.
- 모서리: 카드·패널·버튼·입력칸은 `rounded-lg` (기존 `rounded-3xl`·`rounded-2xl`·`rounded-xl` → `rounded-lg`). 작은 칩(`rounded-md`, `rounded`)과 원형(`rounded-full`)은 그대로.
- 그림자·`backdrop-blur`·그라데이션(`bg-linear-…`, `from-…`)은 모두 제거.
- 선택 상태 = `bg-foreground text-white`, 보조 버튼 = `border-line text-muted hover:text-foreground hover:bg-subtle`.
- 커밋 메시지는 한국어, 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- 각 작업 끝에 `npm run lint`, `npm run typecheck`, `npm test`가 통과해야 한다.

---

### Task 1: 색 토큰과 팔레트

**Files:**
- Create: `src/shared/config/palette.ts`
- Create: `src/shared/config/index.ts`
- Create: `src/shared/config/palette.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `PALETTE` (from `@/shared/config`)
  ```ts
  PALETTE.background | surface | subtle | line | lineStrong | foreground | muted | faint : string
  PALETTE.tone: { idle; compare; change; read; done }  // 모두 string
  PALETTE.slot: readonly [string, string]
  ```
- Produces: Tailwind 클래스 `bg-/text-/border-` × `background, surface, subtle, line, line-strong, foreground, muted, faint, tone-idle, tone-compare, tone-change, tone-read, tone-done, slot-1, slot-2`.

- [ ] **Step 1: 실패하는 테스트 작성** — `src/shared/config/palette.test.ts`

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PALETTE } from "./palette";

const css = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

/** globals.css @theme 안의 --color-* 값 */
function cssToken(name: string): string | undefined {
  return css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1].toLowerCase();
}

describe("PALETTE", () => {
  const flat: Array<[string, string]> = [
    ["background", PALETTE.background],
    ["surface", PALETTE.surface],
    ["subtle", PALETTE.subtle],
    ["line", PALETTE.line],
    ["line-strong", PALETTE.lineStrong],
    ["foreground", PALETTE.foreground],
    ["muted", PALETTE.muted],
    ["faint", PALETTE.faint],
    ...Object.entries(PALETTE.tone).map(([k, v]) => [`tone-${k}`, v] as [string, string]),
    ["slot-1", PALETTE.slot[0]],
    ["slot-2", PALETTE.slot[1]],
  ];

  it.each(flat)("--color-%s 가 globals.css와 같다", (name, value) => {
    expect(cssToken(name)).toBe(value.toLowerCase());
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/shared/config/palette.test.ts`
Expected: FAIL — `Cannot find module './palette'` (또는 그에 해당하는 import 오류)

- [ ] **Step 3: 팔레트 작성** — `src/shared/config/palette.ts`

```ts
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
```

`src/shared/config/index.ts`

```ts
export { PALETTE } from "./palette";
```

- [ ] **Step 4: `globals.css` 토큰으로 교체** — 파일 맨 위의 `:root { … }`와 `@theme inline { … }`, `body { … }` 블록을 아래로 바꾼다.

```css
@import "tailwindcss";

/* 색 토큰. canvas용 src/shared/config/palette.ts와 값이 같아야 한다 */
@theme {
  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-subtle: #f9fafb;
  --color-line: #e5e7eb;
  --color-line-strong: #cbd5e1;
  --color-foreground: #111827;
  --color-muted: #6b7280;
  --color-faint: #9ca3af;

  --color-tone-idle: #94a3b8;
  --color-tone-compare: #f59e0b;
  --color-tone-change: #ef4444;
  --color-tone-read: #0ea5e9;
  --color-tone-done: #10b981;

  --color-slot-1: #2563eb;
  --color-slot-2: #7c3aed;
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

같은 파일의 `.scrubber` 손잡이 두 곳(`::-webkit-slider-thumb`, `::-moz-range-thumb`)의 `box-shadow: 0 0 0 3px rgb(99 102 241 / 0.5);`를 `box-shadow: 0 0 0 2px var(--color-foreground);`로 바꾼다 (`background: #fff`는 유지).

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run src/shared/config/palette.test.ts`
Expected: PASS (15 tests)

- [ ] **Step 6: 전체 확인 후 커밋**

Run: `npm run lint && npm run typecheck && npm test` → 모두 통과

```bash
git add src/shared/config src/app/globals.css
git commit -m "feat: 밝은 테마 색 토큰과 canvas용 팔레트

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: 페이지 틀 (배경·제목·카드·재생 바 자리·푸터)

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/shared/ui/Card.tsx`
- Modify: `src/views/home/ui/HomeView.tsx`
- Modify: `src/views/home/ui/HomePage.tsx`

**Interfaces:**
- Consumes: Task 1 토큰 클래스.

- [ ] **Step 1: `page.tsx`** — 흐릿한 색 번짐 장식 `<div aria-hidden …>` 두 개(6~7행)를 지운다. 나머지는 그대로.

- [ ] **Step 2: `Card.tsx`** — 클래스 문자열을 바꾼다.

| 기존 | 변경 |
|---|---|
| `"rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-2xl p-5 md:p-6"` | `"rounded-lg bg-surface border border-line p-5 md:p-6"` |

- [ ] **Step 3: `HomeView.tsx`**

| 기존 | 변경 |
|---|---|
| `"text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400"` | `"text-3xl md:text-5xl font-bold tracking-tight text-foreground"` |
| `"text-sm md:text-base text-indigo-100/50"` | `"text-sm md:text-base text-muted"` |
| `"sticky top-3 z-30 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl px-4 py-3"` | `"sticky top-3 z-30 rounded-lg bg-surface border border-line px-4 py-3"` |
| `"text-center text-xs text-white/30 pb-4"` | `"text-center text-xs text-faint pb-4"` |
| `"font-mono text-white/50"` (kbd 4곳) | `"font-mono text-muted"` |

`AlgorithmInfoCard`에 넘기는 `accent={i === 0 ? "indigo" : "pink"}`는 Task 7에서 바꾸므로 여기서는 그대로 둔다.

- [ ] **Step 4: `HomePage.tsx`** — 로딩 문구 `"text-white/30 text-center animate-pulse py-32"` → `"text-faint text-center animate-pulse py-32"`.

- [ ] **Step 5: 확인 후 커밋**

Run: `npm run lint && npm run typecheck && npm test` → 통과

```bash
git add src/app/page.tsx src/shared/ui/Card.tsx src/views/home/ui
git commit -m "feat: 페이지 틀을 밝은 테마로 (배경·제목·카드·푸터)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: 막대 (DOM·canvas)와 구조 canvas

**Files:**
- Modify: `src/entities/array/ui/ArrayBars.tsx`
- Modify: `src/entities/array/ui/CanvasBars.tsx`
- Modify: `src/entities/array/index.ts`
- Modify: `src/widgets/visualizer/ui/structure/TreeCanvas.tsx`
- Modify: `src/widgets/visualizer/ui/structure/BinsCanvas.tsx`
- Modify: `src/widgets/visualizer/ui/structure/StructureView.tsx`

**Interfaces:**
- Consumes: `PALETTE` from `@/shared/config`.
- Removes: `BAR_TONE_COLORS` export (`@/entities/array`), `TONE_COLORS` (`CanvasBars.tsx`). 쓰던 곳은 `PALETTE.tone`으로 바꾼다.
- `BAR_TONE_CLASS` 이름·키는 유지 (`VisualizerStage` 범례가 쓴다).

- [ ] **Step 1: `ArrayBars.tsx`**

`BAR_TONE_CLASS`를 통째로 교체:

```ts
/** 막대 색상. 범례(Legend)와 공유한다. canvas는 PALETTE.tone을 쓴다 */
export const BAR_TONE_CLASS: Record<BarTone | "idle" | "done", string> = {
  idle: "bg-tone-idle",
  compare: "bg-tone-compare",
  change: "bg-tone-change",
  read: "bg-tone-read",
  done: "bg-tone-done",
};
```

막대 클래스:

| 기존 | 변경 |
|---|---|
| `"rounded-t-md",` | `"rounded-t-sm",` |
| `tone ? "z-10 opacity-100" : "opacity-85",` | `tone && "z-10",` |
| `"absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/40 select-none"` | `"absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-faint select-none"` |

- [ ] **Step 2: `CanvasBars.tsx`** — `TONE_COLORS` 상수(7~14행)를 지우고 `import { PALETTE } from "@/shared/config";`를 추가한다. 그리기 effect 안의 `gradients`/`fillFor` 정의(52~62행)를 지우고, 막대·표시점 그리는 부분을 아래로 바꾼다.

```ts
    for (let i = 0; i < n; i++) {
      const h = Math.max(1.5, (items[i].value / maxValue) * size.height);
      const tone = highlighted.has(i) ? highlight!.tone : done ? "done" : "idle";
      ctx.fillStyle = PALETTE.tone[tone];
      ctx.fillRect(i * slot, size.height - h, Math.max(1, slot - gap), h);
    }

    // 강조된 막대는 아주 얇을 수 있으므로 위에 표시점을 찍어 눈에 띄게 한다
    for (const i of highlighted) {
      if (i >= n) continue;
      const h = Math.max(1.5, (items[i].value / maxValue) * size.height);
      ctx.fillStyle = PALETTE.tone[highlight!.tone];
      ctx.beginPath();
      ctx.arc((i + 0.5) * slot, size.height - h - 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
```

`import type { BarHighlight, BarTone } from "./ArrayBars";`에서 `BarTone`을 더 쓰지 않으면 `import type { BarHighlight } from "./ArrayBars";`로 줄인다.

- [ ] **Step 3: `entities/array/index.ts`** — 마지막 줄 `export { TONE_COLORS as BAR_TONE_COLORS } from "./ui/CanvasBars";`를 지운다.

- [ ] **Step 4: `TreeCanvas.tsx`** — `import { BAR_TONE_COLORS } from "@/entities/array";` → `import { PALETTE } from "@/shared/config";`. `drawNode`를 아래로 바꾼다.

```ts
    const drawNode = (node: DrawNode, at: Point) => {
      const color = PALETTE.tone[node.tone];
      ctx.globalAlpha = node.faded ? 0.45 : 1;
      ctx.beginPath();
      ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
      if (node.ghost) {
        ctx.setLineDash([3, 2]);
        ctx.lineWidth = Math.max(1, radius / 6);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (showLabels) {
        ctx.globalAlpha = node.ghost ? 0.8 : 1;
        ctx.fillStyle = node.ghost ? color : PALETTE.foreground;
        ctx.fillText(node.label, at.x, at.y + 0.5);
      }
    };
```

간선: `ctx.strokeStyle = "#a5b4fc";` → `ctx.strokeStyle = PALETTE.lineStrong;`, `ctx.globalAlpha = node.faded || node.ghost ? 0.15 : 0.35;` → `ctx.globalAlpha = node.faded || node.ghost ? 0.5 : 1;`.

- [ ] **Step 5: `BinsCanvas.tsx`** — import를 Step 4와 같이 바꾸고 `drawCard`를 아래로 바꾼다.

```ts
    const drawCard = (card: DrawCard, x: number, y: number) => {
      const color = PALETTE.tone[card.tone];
      const h = Math.max(1, cardH - gap);
      ctx.globalAlpha = card.faded ? 0.4 : 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, h, Math.min(4, h / 3));
      if (card.ghost) {
        ctx.setLineDash([3, 2]);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (showValues) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = card.ghost ? color : PALETTE.foreground;
        ctx.fillText(card.label, x + cardW / 2, y + h / 2 + 0.5);
      }
    };
```

칸 바닥선:

| 기존 | 변경 |
|---|---|
| `ctx.globalAlpha = column.active ? 0.6 : 0.2;` | `ctx.globalAlpha = 1;` |
| `ctx.strokeStyle = column.active ? "#fcd34d" : "#a5b4fc";` | `ctx.strokeStyle = column.active ? PALETTE.tone.compare : PALETTE.lineStrong;` |
| `ctx.fillStyle = column.active ? "#fcd34d" : "rgba(255,255,255,0.4)";` | `ctx.fillStyle = column.active ? PALETTE.foreground : PALETTE.faint;` |

- [ ] **Step 6: `StructureView.tsx`** — 캡션 `"absolute top-2 right-3 text-[10px] font-mono text-white/40"` → `"absolute top-2 right-3 text-[10px] font-mono text-muted"`.

- [ ] **Step 7: 확인 후 커밋**

Run: `npm run lint && npm run typecheck && npm test` → 통과 (`BAR_TONE_COLORS`를 쓰는 곳이 남으면 typecheck가 잡는다)

```bash
git add src/entities/array src/widgets/visualizer/ui/structure
git commit -m "feat: 막대·트리·칸을 밝은 테마 단색으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 시각화 패널과 코드 패널

**Files:**
- Modify: `src/widgets/visualizer/ui/VisualizerStage.tsx`
- Modify: `src/entities/sort-algorithm/ui/CodePanel.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Task 1 토큰 클래스.

- [ ] **Step 1: `VisualizerStage.tsx`**

`SLOT_ACCENT` 교체:

```ts
const SLOT_ACCENT = [
  { chip: "bg-slot-1", border: "border-slot-1/30" },
  { chip: "bg-slot-2", border: "border-slot-2/30" },
];
```

| 기존 | 변경 |
|---|---|
| `"px-4 py-3 md:px-5 border-t border-white/5 bg-black/10"` | `"px-4 py-3 md:px-5 border-t border-line bg-subtle"` |
| `className="bg-black/20"` (CodePanel) | `className="bg-surface"` |
| `"flex flex-col rounded-3xl bg-white/[0.04] border backdrop-blur-sm overflow-hidden"` | `"flex flex-col rounded-lg bg-surface border overflow-hidden"` |
| `compare ? SLOT_ACCENT[i].border : "border-white/10"` | `compare ? SLOT_ACCENT[i].border : "border-line"` |
| `"font-bold text-white shrink-0"` | `"font-bold text-foreground shrink-0"` |
| `"text-xs text-white/35 truncate"` | `"text-xs text-muted truncate"` |
| `"ml-auto shrink-0 flex p-0.5 rounded-lg bg-black/30 border border-white/10"` | `"ml-auto shrink-0 flex p-0.5 rounded-lg bg-subtle border border-line"` |
| `showStructure === on ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"` | `showStructure === on ? "bg-foreground text-white" : "text-muted hover:text-foreground"` |
| `"border-indigo-400/50 bg-indigo-500/15 text-indigo-200"` | `"border-foreground bg-foreground text-white"` |
| `"border-white/10 text-white/50 hover:text-white hover:bg-white/10"` | `"border-line text-muted hover:text-foreground hover:bg-subtle"` |
| `"relative border-t lg:border-t-0 lg:border-l border-white/5 h-72 lg:h-auto"` | `"relative border-t lg:border-t-0 lg:border-l border-line h-72 lg:h-auto"` |
| `"border-t border-white/5 h-72 flex flex-col"` | `"border-t border-line h-72 flex flex-col"` |
| `"flex items-center gap-2 text-xs text-white/45"` | `"flex items-center gap-2 text-xs text-muted"` |

- [ ] **Step 2: `CodePanel.tsx`**

`import "prismjs/themes/prism-tomorrow.css";` 줄을 지운다 (문법 색은 Step 3에서 globals.css에 정의).

`ACTIVE_CLASS` 교체:

```ts
/** 현재 줄 강조 색: 막대 색과 맞춘다 (비교 = 노랑, 교환·이동 = 빨강, 읽기 = 파랑) */
const ACTIVE_CLASS: Record<OpType, string> = {
  [OpType.Compare]: "bg-amber-100 border-amber-500",
  [OpType.Swap]: "bg-red-100 border-red-500",
  [OpType.Move]: "bg-red-100 border-red-500",
  [OpType.Mark]: "bg-sky-100 border-sky-500",
};
```

`HEAT_STYLE`의 `rgba(99, 102, 241, ${0.05 + (0.25 * level) / HEAT_LEVELS})` → `rgba(37, 99, 235, ${0.03 + (0.15 * level) / HEAT_LEVELS})`.

| 기존 | 변경 |
|---|---|
| `"w-8 shrink-0 text-right pr-2 text-white/15 select-none"` | `"w-8 shrink-0 text-right pr-2 text-faint select-none"` |
| `"w-10 shrink-0 text-right pr-3 text-[10px] tabular-nums text-indigo-300/70 select-none"` | `"w-10 shrink-0 text-right pr-3 text-[10px] tabular-nums text-slot-1/70 select-none"` |
| `"flex items-center justify-between gap-2 px-3 py-2 border-b border-white/5"` | `"flex items-center justify-between gap-2 px-3 py-2 border-b border-line"` |
| `"text-[11px] font-mono text-white/40 truncate"` | `"text-[11px] font-mono text-muted truncate"` |
| `"text-[11px] font-bold px-2 py-1 rounded-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"` | `"text-[11px] font-bold px-2 py-1 rounded-md border border-line text-muted hover:text-foreground hover:bg-subtle transition-all"` |
| `[scrollbar-color:rgb(255_255_255/0.15)_transparent]` | `[scrollbar-color:rgb(0_0_0/0.15)_transparent]` |
| `<pre className="text-[12px] font-mono"` | `<pre className="text-[12px] font-mono text-foreground"` |

- [ ] **Step 3: `globals.css` 끝(`@media (prefers-reduced-motion…)` 앞)에 문법 색 추가**

```css
/* 코드 패널 문법 색 (Prism 토큰, 밝은 바탕용) */
.token.comment {
  color: var(--color-muted);
  font-style: italic;
}
.token.keyword {
  color: #7c3aed;
}
.token.function {
  color: #2563eb;
}
.token.number,
.token.boolean {
  color: #c2410c;
}
.token.string {
  color: #15803d;
}
.token.class-name {
  color: #b45309;
}
.token.operator,
.token.punctuation {
  color: #4b5563;
}
```

- [ ] **Step 4: 확인 후 커밋**

Run: `npm run lint && npm run typecheck && npm test` → 통과

```bash
git add src/widgets/visualizer/ui/VisualizerStage.tsx src/entities/sort-algorithm/ui/CodePanel.tsx src/app/globals.css
git commit -m "feat: 시각화 패널과 코드 패널을 밝은 테마로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: 재생 바·통계·소리 버튼

**Files:**
- Modify: `src/features/playback/ui/PlaybackBar.tsx`
- Modify: `src/features/playback/ui/TrackStatsView.tsx`
- Modify: `src/features/sort-sound/ui/SoundToggle.tsx`
- Modify: `src/features/sort-sound/ui/SlotMuteButton.tsx`

- [ ] **Step 1: `PlaybackBar.tsx`** — `IconButton`의 클래스 묶음을 교체:

```ts
      className={cn(
        "flex items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-foreground",
        variant === "ghost" && "w-9 h-9 text-muted hover:text-foreground hover:bg-subtle",
        variant === "primary" && "w-11 h-11 bg-foreground hover:bg-gray-700 text-white",
        variant === "danger" && "w-11 h-11 bg-tone-change hover:bg-red-600 text-white"
      )}
```

| 기존 | 변경 |
|---|---|
| `"flex justify-between gap-3 whitespace-nowrap text-[11px] font-mono text-white/40"` | `"flex justify-between gap-3 whitespace-nowrap text-[11px] font-mono text-muted"` |
| `computing && "text-indigo-300 animate-pulse"` | `computing && "text-foreground animate-pulse"` |
| `<span className="text-indigo-300">{cursor.toLocaleString()}</span>` | `<span className="text-foreground">{cursor.toLocaleString()}</span>` |
| `"absolute inset-x-0 h-1.5 rounded-full bg-white/10 overflow-hidden"` | `"absolute inset-x-0 h-1.5 rounded-full bg-line overflow-hidden"` |
| `"h-full bg-linear-to-r from-indigo-500 to-pink-500"` | `"h-full bg-foreground"` |
| `"shrink-0 whitespace-nowrap text-[11px] font-bold text-white/40"` | `"shrink-0 whitespace-nowrap text-[11px] font-bold text-muted"` |
| `"flex-1 accent-indigo-500"` | `"flex-1 accent-gray-900"` |
| `"w-14 text-right text-sm font-mono font-bold text-indigo-300"` | `"w-14 text-right text-sm font-mono font-bold text-foreground"` |

- [ ] **Step 2: `TrackStatsView.tsx`** — 흰 바탕에서 읽히도록 통계 숫자는 한 단계 진한 색을 쓴다.

| 기존 | 변경 |
|---|---|
| `"text-[10px] font-bold uppercase tracking-wider text-white/30"` | `"text-[10px] font-bold uppercase tracking-wider text-faint"` |
| `className="text-amber-300"` | `className="text-amber-600"` |
| `className="text-rose-300"` (2곳) | `className="text-red-600"` |
| `className="text-sky-300"` | `className="text-sky-600"` |
| `"text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30"` | `"text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"` |
| `"text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"` | `"text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"` |
| `"text-xs font-mono text-white/40 tabular-nums"` | `"text-xs font-mono text-muted tabular-nums"` |

- [ ] **Step 3: `SoundToggle.tsx`**

| 기존 | 변경 |
|---|---|
| `"w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-indigo-400"` | `"w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-foreground"` |
| `enabled ? "text-indigo-200 bg-indigo-500/20" : "text-white/40 hover:text-white hover:bg-white/10"` | `enabled ? "text-white bg-foreground" : "text-muted hover:text-foreground hover:bg-subtle"` |

- [ ] **Step 4: `SlotMuteButton.tsx`**

```ts
/** 슬롯 색에 맞춘 강조 (1번 파랑, 2번 보라) */
const ON_CLASS = ["text-slot-1 bg-blue-50", "text-slot-2 bg-violet-50"] as const;
```

| 기존 | 변경 |
|---|---|
| `focus-visible:outline-indigo-400` | `focus-visible:outline-foreground` |
| `muted ? "text-white/30 hover:text-white/70 hover:bg-white/10" : ON_CLASS[slot]` | `muted ? "text-faint hover:text-muted hover:bg-subtle" : ON_CLASS[slot]` |

- [ ] **Step 5: 확인 후 커밋**

Run: `npm run lint && npm run typecheck && npm test` → 통과

```bash
git add src/features/playback/ui src/features/sort-sound/ui
git commit -m "feat: 재생 바·통계·소리 버튼을 밝은 테마로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: 알고리즘 선택·옵션·데이터 설정·정보 카드

**Files:**
- Modify: `src/features/select-algorithm/ui/AlgorithmPicker.tsx`
- Modify: `src/features/select-algorithm/ui/AlgorithmOptions.tsx`
- Modify: `src/features/configure-array/ui/ArrayConfigurator.tsx`
- Modify: `src/entities/sort-algorithm/ui/AlgorithmInfoCard.tsx`
- Modify: `src/views/home/ui/HomeView.tsx`

**Interfaces:**
- Changes: `AlgorithmInfoCard` prop `accent?: "indigo" | "pink"` → `slot?: 0 | 1` (기본 0). `HomeView`는 `slot={i as 0 | 1}`로 넘긴다.

- [ ] **Step 1: `AlgorithmPicker.tsx`**

```ts
const SLOT_STYLE = {
  0: { chip: "bg-slot-1 text-white", ring: "border-slot-1 bg-blue-50 text-slot-1" },
  1: { chip: "bg-slot-2 text-white", ring: "border-slot-2 bg-violet-50 text-slot-2" },
} as const;
```

| 기존 | 변경 |
|---|---|
| `"text-white font-bold text-lg"` | `"text-foreground font-bold text-lg"` |
| `"text-sm text-white/60"` | `"text-sm text-muted"` |
| `compareMode ? "bg-pink-500" : "bg-white/15"` | `compareMode ? "bg-foreground" : "bg-gray-200"` |
| `"flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all"` | `"flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all"` |
| `"border-white/10 text-white/50 hover:bg-white/5"` | `"border-line text-muted hover:bg-subtle"` |
| `"w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400"` | `"w-full bg-surface border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:border-foreground"` |
| `"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"` | `"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none"` |
| `"text-xs text-white/40 -mb-2"` | `"text-xs text-muted -mb-2"` |
| `"flex gap-1 p-1 bg-black/20 rounded-xl overflow-x-auto no-scrollbar"` | `"flex gap-1 p-1 bg-subtle border border-line rounded-lg overflow-x-auto no-scrollbar"` |
| `"flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all"` | `"flex-1 px-3 py-2 rounded-md text-xs md:text-sm font-bold whitespace-nowrap transition-all"` |
| `category === c.id ? "bg-white/10 text-white shadow" : "text-white/40 hover:text-white/70"` | `category === c.id ? "bg-foreground text-white" : "text-muted hover:text-foreground"` |
| `"text-sm text-white/40 text-center py-6"` | `"text-sm text-muted text-center py-6"` |
| `"relative flex flex-col items-start gap-1 px-3 py-3 rounded-xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"` | `"relative flex flex-col items-start gap-1 px-3 py-3 rounded-lg border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"` |
| `"border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white/90"` | `"border-line bg-surface text-gray-700 hover:bg-subtle hover:text-foreground"` |
| `"text-[10px] font-bold text-white/30"` | `"text-[10px] font-bold text-faint"` |
| `"text-[11px] leading-snug text-white/35"` | `"text-[11px] leading-snug text-muted"` |

- [ ] **Step 2: `AlgorithmOptions.tsx`**

```ts
const SLOT_CHIP = ["bg-slot-1", "bg-slot-2"] as const;

const inputClass =
  "bg-surface border border-line rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:border-foreground disabled:opacity-50";
```

| 기존 | 변경 |
|---|---|
| `"flex flex-col gap-3 p-4 rounded-2xl bg-black/20 border border-white/5"` | `"flex flex-col gap-3 p-4 rounded-lg bg-subtle border border-line"` |
| `"flex items-center gap-2 text-xs font-bold text-white/60"` | `"flex items-center gap-2 text-xs font-bold text-muted"` |
| `"text-xs font-bold text-white/50"` | `"text-xs font-bold text-muted"` |
| `"text-[11px] text-white/30"` | `"text-[11px] text-faint"` |
| `"flex justify-between text-xs font-bold text-white/50"` | `"flex justify-between text-xs font-bold text-muted"` |
| `"font-mono text-indigo-300"` | `"font-mono text-foreground"` |
| `className="accent-indigo-500"` | `className="accent-gray-900"` |

- [ ] **Step 3: `ArrayConfigurator.tsx`**

| 기존 | 변경 |
|---|---|
| `"text-xs text-rose-300"` | `"text-xs text-red-600"` |
| `"text-white font-bold text-lg"` | `"text-foreground font-bold text-lg"` |
| `"text-sm text-white/60 shrink-0"` | `"text-sm text-muted shrink-0"` |
| `"w-24 bg-black/30 border rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"` | `"w-24 bg-surface border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none"` |
| `sizeError ? "border-rose-400" : "border-white/10 focus:border-indigo-400"` | `sizeError ? "border-red-500" : "border-line focus:border-foreground"` |
| `"text-xs text-white/30"` | `"text-xs text-faint"` |
| `"px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95"` | `"px-3 py-2 rounded-lg border text-xs font-bold transition-all active:scale-95"` |
| `"border-purple-400 bg-purple-500/15 text-purple-200"` | `"border-foreground bg-foreground text-white"` |
| `"border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white/90"` | `"border-line bg-surface text-gray-700 hover:bg-subtle hover:text-foreground"` |
| `"text-[11px] text-white/30"` | `"text-[11px] text-faint"` |
| `className="text-sm text-white/60"` (직접 입력 label) | `className="text-sm text-muted"` |
| `"text-white/30 text-xs"` | `"text-faint text-xs"` |
| `"flex-1 min-w-0 bg-black/30 border rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none"` | `"flex-1 min-w-0 bg-surface border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none"` |
| `customError ? "border-rose-400" : "border-white/10 focus:border-indigo-400"` | `customError ? "border-red-500" : "border-line focus:border-foreground"` |
| `"px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-600/40 transition-all disabled:opacity-40"` | `"px-4 py-2 rounded-lg text-sm font-bold bg-foreground text-white border border-foreground hover:bg-gray-700 transition-all disabled:opacity-40"` |

- [ ] **Step 4: `AlgorithmInfoCard.tsx`** — prop과 색을 바꾼다.

```tsx
type Props = {
  algorithm: SortAlgorithm;
  /** 비교 모드 슬롯 (제목 색) */
  slot?: 0 | 1;
  className?: string;
};

const SLOT_TEXT = ["text-slot-1", "text-slot-2"] as const;

export default function AlgorithmInfoCard({ algorithm, slot = 0, className }: Props) {
```

| 기존 | 변경 |
|---|---|
| `cn("font-bold", ACCENT[accent])` | `cn("font-bold", SLOT_TEXT[slot])` |
| `"text-xs text-white/45 mt-0.5"` | `"text-xs text-muted mt-0.5"` |
| `"text-emerald-300 bg-emerald-500/10 border-emerald-500/25"` | `"text-emerald-700 bg-emerald-50 border-emerald-200"` |
| `"text-white/40 bg-white/5 border-white/10"` | `"text-muted bg-subtle border-line"` |
| `"flex flex-col gap-0.5 rounded-lg bg-black/20 px-2 py-1.5"` | `"flex flex-col gap-0.5 rounded-lg bg-subtle border border-line px-2 py-1.5"` |
| `"text-[10px] text-white/30"` | `"text-[10px] text-faint"` |
| `"text-xs font-mono text-white/80 break-words"` | `"text-xs font-mono text-foreground break-words"` |
| `"text-[11px] leading-relaxed text-amber-200/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"` | `"text-[11px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"` |

기존 `ACCENT` 상수는 지운다.

- [ ] **Step 5: `HomeView.tsx`** — `accent={i === 0 ? "indigo" : "pink"}` → `slot={i as 0 | 1}`.

- [ ] **Step 6: 확인 후 커밋**

Run: `npm run lint && npm run typecheck && npm test` → 통과

```bash
git add src/features/select-algorithm/ui src/features/configure-array/ui src/entities/sort-algorithm/ui/AlgorithmInfoCard.tsx src/views/home/ui/HomeView.tsx
git commit -m "feat: 알고리즘 선택·데이터 설정·정보 카드를 밝은 테마로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: 남은 어두운 클래스 검사·브라우저 확인·문서

**Files:**
- Create: `src/app/theme.test.ts`
- Modify: `DEVELOPMENT_LOG.md`
- Modify: `README.md` (색·디자인을 설명하는 문장이 있으면)

- [ ] **Step 1: 검사 테스트 작성** — `src/app/theme.test.ts`

```ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("..", import.meta.url));

/** 어두운 테마 시절의 클래스·색. 밝은 테마에서는 토큰(bg-surface, text-muted …)을 쓴다 */
const FORBIDDEN = [
  /text-white\//,
  /bg-white\//,
  /border-white/,
  /bg-black/,
  /bg-slate-/,
  /indigo/,
  /pink-/,
  /purple-/,
  /rose-/,
  /backdrop-blur/,
  /rounded-3xl/,
  /bg-linear-/,
  /shadow-\[/,
  /#0f172a/i,
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : [];
  });
}

describe("밝은 테마", () => {
  it("어두운 테마용 클래스·색이 남아 있지 않다", () => {
    const hits = sourceFiles(SRC).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) =>
          FORBIDDEN.filter((re) => re.test(line)).map((re) => `${file}:${i + 1} ${re}`)
        )
    );
    expect(hits).toEqual([]);
  });
});
```

- [ ] **Step 2: 실행**

Run: `npx vitest run src/app/theme.test.ts`
Expected: PASS. 실패하면 출력된 `파일:줄`을 Task 2~6의 규칙(Global Constraints)대로 토큰 클래스로 고친 뒤 다시 실행한다.

- [ ] **Step 3: 전체 확인**

Run: `npm run lint && npm run typecheck && npm test` → 통과

- [ ] **Step 4: 브라우저 확인** — `npm run dev`를 띄우고 아래를 직접 본다. 어색한 대비(흰 바탕 위 너무 흐린 글자, 안 보이는 테두리)가 있으면 그 자리에서 토큰을 고친다.
  - 단일 모드 (버블 정렬, 30개): 막대 숫자, 재생·되감기, 코드 패널 줄 하이라이트, 범례
  - 비교 모드: 슬롯 1·2 색(파랑·보라), 슬롯 음소거 버튼, "먼저 완료" 배지
  - 막대 300개 (canvas 막대) 재생
  - 힙 정렬 트리 보기, 버킷 정렬 칸 보기
  - 알고리즘 검색("퀵"), 분류 탭, 셸 정렬 간격 입력·버킷 수 슬라이더
  - 사용자 배열 입력 오류 문구 (예: `abc`)
  - 보고 정렬 주의 문구, 한도 도달 배지

- [ ] **Step 5: `DEVELOPMENT_LOG.md`** — `### 33.` 항목 다음, `---` 앞에 추가하고 맨 아래 날짜를 `_마지막 업데이트: 2026-10-23_`로 바꾼다.

```markdown
### 34. 🤍 밝은 테마로 디자인 개편

- 어두운 남색 + 보라·분홍 그라데이션 + 반투명 유리 카드 → 흰 바탕 + 얇은 회색 테두리의 밝은 테마 하나로. 레이아웃·동작은 그대로.
- 색을 의미 토큰으로 모음: `globals.css`의 `@theme`(`bg-surface`, `text-muted`, `bg-tone-compare`, `bg-slot-1` …)과 canvas용 `shared/config/palette.ts`. 두 곳의 값이 같은지 테스트로 확인.
- 막대·트리·칸은 그라데이션·빛번짐 없이 상태별 단색. 비교 모드 슬롯 색은 파랑·보라.
- 코드 패널은 어두운 Prism 테마 대신 밝은 바탕용 문법 색을 직접 정의.
- 어두운 테마용 클래스(`text-white/…`, `indigo`, `backdrop-blur` 등)가 다시 들어오지 않도록 소스 검사 테스트 추가.
```

- [ ] **Step 6: README** — `grep -n -iE "다크|어두|그라데이션|indigo|색" README.md`로 디자인 설명 문장을 찾아 밝은 테마에 맞게 고친다. 해당 문장이 없으면 건너뛴다.

- [ ] **Step 7: 커밋**

```bash
git add src/app/theme.test.ts DEVELOPMENT_LOG.md README.md
git commit -m "test: 어두운 테마 클래스 잔존 검사 + 개발 로그

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
