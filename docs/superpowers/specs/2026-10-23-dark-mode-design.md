# 다크 모드(D3) 추가

## 목표

밝은 테마(C1, `2026-10-23-light-theme-design.md`) 위에 어두운 테마를 더한다.
구조는 같고(얇은 테두리, 단색 막대) 바탕만 GitHub 다크 계열의 짙은 남회색이다.
밝은 테마 문서의 "다크 모드는 남기지 않는다"는 이 문서로 대체한다.

- 레이아웃·동작은 바꾸지 않는다. 추가되는 요소는 테마 전환 버튼 하나뿐이다.
- 모바일 점검은 하지 않는다.

## 전환 방식

- `<html>`의 `data-theme` 속성(`light` | `dark`)이 테마를 정한다.
- 처음 방문하면 OS 설정(`prefers-color-scheme`)을 따른다.
- 페이지 제목 오른쪽 위의 해/달 아이콘 버튼으로 바꾼다. 선택은 `localStorage`의 `theme` 키에 저장하고, 저장된 값이 있으면 OS 설정보다 우선한다.
- 깜빡임 방지: `layout.tsx`의 `<head>`에 작은 인라인 스크립트를 넣어 화면을 그리기 전에 `data-theme`를 정한다. `<html>`에 `suppressHydrationWarning`을 둔다. `localStorage` 접근은 try/catch로 감싼다.
- 다크일 때 `color-scheme: dark`를 지정해 스크롤바·입력칸 기본 색도 어둡게 한다.

## 색

`globals.css`의 `:root[data-theme="dark"]`에서 같은 토큰을 다시 정의한다. 클래스(`bg-surface` 등)는 그대로다.

| 토큰 | 밝은 값 | 어두운 값 |
|---|---|---|
| `background` | `#ffffff` | `#0d1117` |
| `surface` | `#ffffff` | `#161b22` |
| `subtle` | `#f9fafb` | `#1c2128` |
| `line` | `#e5e7eb` | `#30363d` |
| `line-strong` | `#cbd5e1` | `#484f58` |
| `foreground` | `#111827` | `#e6edf3` |
| `muted` | `#6b7280` | `#8b949e` |
| `faint` | `#9ca3af` | `#6e7681` |
| `tone-idle` | `#94a3b8` | `#6e7681` |
| `tone-compare` | `#f59e0b` | `#fbbf24` |
| `tone-change` | `#ef4444` | `#f87171` |
| `tone-read` | `#0ea5e9` | `#38bdf8` |
| `tone-done` | `#10b981` | `#34d399` |
| `slot-1` | `#2563eb` | `#60a5fa` |
| `slot-2` | `#7c3aed` | `#a78bfa` |

### 뒤집힌 글자

`bg-foreground` 위의 흰 글자(`text-white`)는 다크에서 밝은 바탕 위 흰 글자가 되어 보이지 않는다.
모두 `text-background`로 바꿔 항상 버튼 바탕의 반대 색이 되게 한다.

### Tailwind 기본 색

`@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`로 `dark:`가 `data-theme`를 따르게 하고, 직접 쓴 기본 색에 `dark:` 변형을 붙인다.

| 쓰는 곳 | 밝은 | 어두운 |
|---|---|---|
| 안정 정렬 배지·통계 완료 줄 | `bg-emerald-50 text-emerald-700 border-emerald-200` | `bg-emerald-500/15 text-emerald-300 border-emerald-500/30` |
| 주의 문구·통계 경고 줄 | `bg-amber-50 text-amber-800 border-amber-200` | `bg-amber-500/10 text-amber-200 border-amber-500/30` |
| 코드 현재 줄 바탕 | `bg-amber-100` / `bg-red-100` / `bg-sky-100` | `bg-amber-500/20` / `bg-red-500/20` / `bg-sky-500/20` (테두리 500은 그대로) |
| 통계 글자 | `text-amber-700` / `text-red-600` / `text-sky-700` | `text-amber-300` / `text-red-400` / `text-sky-300` |
| 오류 글자 | `text-red-600` | `text-red-400` |
| 옅은 파랑 바탕 (선택 항목·슬롯 음소거) | `bg-blue-50` | `bg-blue-500/15` |
| 스위치 꺼짐 | `bg-gray-400` | `bg-gray-600` |
| 회색 글자 | `text-gray-700` | `text-gray-300` |
| 주요 버튼 hover | `bg-gray-700` | `bg-gray-300` |
| 슬라이더 강조 (속도·버킷 수) | `accent-gray-900` → `accent-foreground` (토큰이라 자동) | |
| 코드 패널 스크롤바 | `rgb(0 0 0 / 0.15)` | `rgb(255 255 255 / 0.15)` |

`bg-red-600`(정지 등 경고 버튼), `border-red-500`처럼 두 바탕 모두에서 잘 보이는 색은 그대로 둔다.

## canvas

- `PALETTE`를 `PALETTE.light`·`PALETTE.dark` 두 벌로 나눈다 (구조는 지금과 같음).
- 상태색으로 채운 노드·카드 위 값 글자는 `onTone`을 쓴다 (밝은 `#111827`, 어두운 `#0d1117`). 다크의 상태색이 밝아서 밝은 글자는 대비가 모자라다.
- `shared/lib`에 현재 테마를 돌려주는 `useTheme()`를 둔다. `<html>`의 `data-theme` 변화를 `MutationObserver`로 지켜보고 `useSyncExternalStore`로 읽는다.
- `CanvasBars`·`TreeCanvas`·`BinsCanvas`는 `PALETTE[theme]`를 쓰고, 테마가 바뀌면 다시 그린다.

## 코드 패널

- `.token.*` 문법 색을 다크용으로 한 벌 더 둔다: 주석 `#8b949e` 기울임, keyword `#c4b5fd`, function `#93c5fd`, number·boolean `#fdba74`, string `#86efac`, class-name `#fcd34d`, operator·punctuation `#c9d1d9`.
- 줄별 실행 횟수 색은 다크에서 `rgba(96,165,250,…)`(슬롯 1 다크 값)을 쓴다.

## 코드 위치

- 테마 상태 읽기·쓰기: `src/shared/lib/theme` (`useTheme`, `setTheme`, 저장 키, 초기화 스크립트 문자열).
- 전환 버튼: `src/features/toggle-theme/ui/ThemeToggle.tsx` (`SoundToggle`과 같은 크기·모양, 해/달 아이콘, `aria-label`은 "어두운 테마로" / "밝은 테마로").
- 버튼 위치: `HomeView`의 `<header>`를 `relative`로 하고 오른쪽 위에 둔다.

## 테스트

- 팔레트 동기화 테스트: 밝은 값은 `@theme`, 어두운 값은 `[data-theme="dark"]` 블록과 `PALETTE.dark`가 같은지 확인한다.
- 테마 검사 테스트: 금지 목록에 `\btext-white\b`를 더한다.
- `theme` 모듈: 저장된 값 우선, 없으면 OS 설정, 잘못된 값은 무시하는 초기 테마 결정 함수를 단위 테스트한다.

## 범위 밖

- 테마 세 가지 이상, "시스템 따르기"로 되돌리는 세 번째 상태.
- 방문 중 OS 설정이 바뀔 때 실시간으로 따라가기.
- 모바일 대응.

## 확인

- `npm run lint`, `npm run typecheck`, `npm test` 통과.
- 브라우저에서 두 테마 모두 확인: 단일·비교 모드, DOM 막대와 canvas 막대, 트리·칸 보기, 코드 패널(문법 색·줄 강조), 알고리즘 목록, 주의 문구, 통계.
- 새로 고침해도 깜빡이지 않고 선택이 유지되는지 확인.
