# 알고리즘 선택 사이드바 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 알고리즘 58개를 계열별 폴더 트리로 정리하고, 이를 왼쪽 고정 사이드바에서 고를 수 있게 한다.

**Architecture:**
- 폴더 구성은 `entities/sort-algorithm`의 데이터(`FAMILIES`)로 둔다.
- 사이드바 UI는 `features/select-algorithm`의 `AlgorithmSidebar`가 맡는다. 기존 `AlgorithmPicker`와 props가 같아서 그대로 바꿔 끼울 수 있다.
- `HomeView`를 `사이드바 | 본문` 두 칸 그리드로 바꾼다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind, Vitest(node 환경, `src/**/*.test.ts`만 실행)

**Spec:** `docs/superpowers/specs/2026-10-27-algorithm-sidebar-design.md`

## Global Constraints
- 데스크톱만 고려한다. 모바일 대응은 하지 않는다.
- 알고리즘 정의 파일(`src/entities/sort-algorithm/algorithms/*.ts`)은 수정하지 않는다.
- `category` 필드는 유지하고, `CATEGORIES`는 제거한다.
- UI 문구는 한국어로 쓴다. 커밋 메시지 끝에는 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`을 붙인다.

---

### Task 1: 폴더 데이터 (`FAMILIES`)

**Files:**
- Create: `src/entities/sort-algorithm/model/families.ts`
- Test: `src/entities/sort-algorithm/model/families.test.ts`
- Modify: `src/entities/sort-algorithm/core.ts`

**Interfaces:**
- Produces:
  - `type AlgorithmFamily`
  - `FAMILIES: ReadonlyArray<{ id: AlgorithmFamily; name: string; ids: readonly AlgorithmId[] }>`
  - `getFamily(id: AlgorithmId): AlgorithmFamily`
  - 세 가지 모두 `@/entities/sort-algorithm`에서 내보낸다.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from "vitest";
import { FAMILIES, getFamily } from "./families";
import { ALGORITHMS } from "./registry";

describe("알고리즘 폴더", () => {
  it("모든 알고리즘이 정확히 한 폴더에 들어 있다 (빠지거나 겹치면 실패)", () => {
    const listed = FAMILIES.flatMap((f) => f.ids);
    expect([...listed].sort()).toEqual(ALGORITHMS.map((a) => a.id).sort());
  });

  it("폴더 id는 겹치지 않고 빈 폴더가 없다", () => {
    expect(new Set(FAMILIES.map((f) => f.id)).size).toBe(FAMILIES.length);
    for (const f of FAMILIES) expect(f.ids.length).toBeGreaterThan(0);
  });

  it("getFamily는 알고리즘이 든 폴더를 돌려준다", () => {
    expect(getFamily("bubble")).toBe("exchange");
    expect(getFamily("pancake")).toBe("selection");
    expect(getFamily("tim")).toBe("hybrid");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/entities/sort-algorithm/model/families.test.ts`
Expected: FAIL (`./families`를 찾을 수 없음)

- [ ] **Step 3: 구현**

```ts
import type { AlgorithmId } from "./registry";

export type AlgorithmFamily =
  | "exchange"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap"
  | "tree"
  | "distribution"
  | "network"
  | "hybrid"
  | "fun";

/** 선택 사이드바의 폴더 구성. 순서대로 보여준다. */
export const FAMILIES: ReadonlyArray<{ id: AlgorithmFamily; name: string; ids: readonly AlgorithmId[] }> = [
  { id: "exchange", name: "교환 정렬", ids: ["bubble", "cocktail", "comb", "gnome", "oddEven", "exchange", "circle"] },
  { id: "selection", name: "선택 정렬", ids: ["selection", "doubleSelection", "cycle", "pancake"] },
  { id: "insertion", name: "삽입 정렬", ids: ["insertion", "binaryInsertion", "shell", "mergeInsertion"] },
  { id: "merge", name: "병합 정렬", ids: ["merge", "bottomUpMerge", "naturalMerge", "strand", "patience"] },
  { id: "quick", name: "퀵 정렬", ids: ["quick", "quick3", "hoareQuick", "dualPivot"] },
  { id: "heap", name: "힙 정렬", ids: ["heap", "ternaryHeap", "bottomUpHeap", "weakHeap", "smooth"] },
  { id: "tree", name: "트리 정렬", ids: ["tree", "splay", "cartesian", "tournament"] },
  {
    id: "distribution",
    name: "비교 없는 정렬",
    ids: ["counting", "radix", "msdRadix", "radixExchange", "bucket", "pigeonhole", "spread", "americanFlag", "flash"],
  },
  { id: "network", name: "정렬 네트워크", ids: ["bitonic", "oddEvenMerge", "pairwise"] },
  { id: "hybrid", name: "하이브리드", ids: ["tim", "intro", "pdq", "block", "grail"] },
  {
    id: "fun",
    name: "재미있는 정렬",
    ids: ["bogo", "bogobogo", "bozo", "quantumBogo", "miracle", "permutation", "stooge", "slow"],
  },
];

const familyOf = new Map<AlgorithmId, AlgorithmFamily>(
  FAMILIES.flatMap((f) => f.ids.map((id) => [id, f.id] as const))
);

export function getFamily(id: AlgorithmId): AlgorithmFamily {
  return familyOf.get(id)!;
}
```

`core.ts`의 registry export 아래에 다음을 추가한다.

```ts
export { FAMILIES, getFamily, type AlgorithmFamily } from "./model/families";
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/entities/sort-algorithm/model/families.test.ts`
Expected: 3 passed

- [ ] **Step 5: 커밋**

```bash
git add src/entities/sort-algorithm/model/families.ts src/entities/sort-algorithm/model/families.test.ts src/entities/sort-algorithm/core.ts
git commit -m "feat: 알고리즘 계열별 폴더 구성 추가"
```

---

### Task 2: `AlgorithmSidebar` 컴포넌트

**Files:**
- Create: `src/features/select-algorithm/ui/AlgorithmSidebar.tsx`
- Delete: `src/features/select-algorithm/ui/AlgorithmPicker.tsx`
- Modify: `src/features/select-algorithm/index.ts`
- Modify: `src/views/home/ui/HomeView.tsx` (import 이름만 바꾼다)
- Modify: `src/entities/sort-algorithm/model/registry.ts`, `src/entities/sort-algorithm/core.ts` (`CATEGORIES` 제거)

**Interfaces:**
- Consumes: Task 1의 `FAMILIES`, `getFamily`, `AlgorithmFamily`
- Produces:
  - `AlgorithmSidebar`(default export). props는 `{ compareMode, onCompareModeChange, selected, onSelect, disabled? }`로 기존 Picker와 같다.
  - `type Slot = 0 | 1`

- [ ] **Step 1: 컴포넌트 작성**

`AlgorithmSidebar.tsx`의 핵심 로직은 다음과 같다. 스위치, 슬롯 탭, 검색창 마크업과 문구는 `AlgorithmPicker.tsx`에서 그대로 옮긴다.

```tsx
const [activeSlot, setActiveSlot] = useState<Slot>(0);
const slot: Slot = compareMode ? activeSlot : 0;
const otherSlot: Slot = slot === 0 ? 1 : 0;

// 처음에는 선택된 알고리즘이 든 폴더만 펼친다
const [open, setOpen] = useState<ReadonlySet<AlgorithmFamily>>(
  () => new Set((compareMode ? selected : selected.slice(0, 1)).map(getFamily))
);

const [query, setQuery] = useState("");
const searching = query.trim() !== "";
const matched = searching ? new Set<string>(searchAlgorithms(query).map((a) => a.id)) : null;
// 검색 중에는 일치하는 항목이 있는 폴더만, 모두 펼쳐 보여준다 (펼침 상태는 건드리지 않는다)
const folders = FAMILIES.map((f) => ({ ...f, ids: matched ? f.ids.filter((id) => matched.has(id)) : f.ids })).filter(
  (f) => f.ids.length > 0
);
const resultCount = folders.reduce((sum, f) => sum + f.ids.length, 0);

const toggleFolder = (id: AlgorithmFamily) =>
  setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

const switchSlot = (next: Slot) => {
  setActiveSlot(next);
  setOpen((prev) => new Set(prev).add(getFamily(selected[next])));
};
```

- 바깥: `<nav className="flex flex-col gap-4 h-full min-h-0" aria-label="알고리즘 선택">`
- 트리: `<ul className="flex-1 min-h-0 overflow-y-auto">`
  - 폴더 버튼: `aria-expanded={searching || open.has(f.id)}`. 검색 중에는 onClick이 없다. 회전하는 chevron 아이콘, 이름, 개수(`f.ids.length`)를 보여준다.
  - 항목 목록: `<ul className="ml-3 border-l border-line pl-2">`
  - 항목 버튼:
    - `aria-pressed={selected[slot] === id}`, `disabled={disabled}`, `title={algo.desc}`, `onClick={() => onSelect(slot, id)}`
    - 선택되면 `SLOT_STYLE[slot].ring`으로 강조한다.
    - 비교 모드에서 `selected[otherSlot] === id`이면 오른쪽에 슬롯 배지를 단다.
- 검색 결과가 0개이면 `"{query}"에 맞는 알고리즘이 없어요.`를 보여준다. 결과가 있으면 `검색 결과 N개`를 `aria-live="polite"`로 보여준다.

- [ ] **Step 2: 연결과 정리**
  - `index.ts`: `export { default as AlgorithmSidebar, type Slot } from "./ui/AlgorithmSidebar";`
  - `HomeView.tsx`: `AlgorithmPicker`를 `AlgorithmSidebar`로 바꾼다(이 단계에서는 import와 태그 이름만 바꾼다).
  - `AlgorithmPicker.tsx`를 삭제한다.
  - `registry.ts`와 `core.ts`에서 `CATEGORIES`를 제거한다. 다른 사용처가 없는지 `grep -rn CATEGORIES src`로 확인한다.

- [ ] **Step 3: 검증**

Run: `npx tsc --noEmit; npx vitest run; npx eslint src/features/select-algorithm src/entities/sort-algorithm`
Expected: 타입 오류 0, 테스트 전부 통과, lint 오류 0

- [ ] **Step 4: 커밋**

```bash
git add -A src
git commit -m "feat: 알고리즘 선택을 폴더 트리 사이드바로 교체"
```

---

### Task 3: 페이지 레이아웃 (사이드바 | 본문)

**Files:**
- Modify: `src/app/page.tsx` (`max-w-6xl` → `max-w-7xl`)
- Modify: `src/views/home/ui/HomeView.tsx` (return JSX)

**Interfaces:**
- Consumes: Task 2의 `AlgorithmSidebar`

- [ ] **Step 1: 레이아웃 변경**

```tsx
<div className="grid grid-cols-[260px_minmax(0,1fr)] gap-6 items-start w-full">
  <aside className="sticky top-3 h-[calc(100vh-1.5rem)] flex flex-col rounded-lg bg-surface border border-line p-4">
    <AlgorithmSidebar
      compareMode={state.compare}
      onCompareModeChange={(compare) => update({ compare })}
      selected={state.algorithms}
      onSelect={selectAlgorithm}
    />
  </aside>

  <div className="flex flex-col gap-6 min-w-0">
    {/* header, sticky 재생바, VisualizerStage: 기존 그대로 */}
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <Card className="flex flex-col gap-5">
        <ArrayConfigurator ... />
        <AlgorithmOptions ... />   {/* 옵션이 없으면 null을 반환하므로 카드에는 배열 설정만 남는다 */}
      </Card>
      <Card className="flex flex-col gap-5">{/* AlgorithmInfoCard들: 기존 그대로 */}</Card>
    </div>
    {/* footer: 기존 그대로 */}
  </div>
</div>
```

- [ ] **Step 2: 정적 검증**

Run: `npx tsc --noEmit; npx vitest run; npx eslint src`
Expected: 전부 통과

- [ ] **Step 3: 브라우저 검증** (`npm run dev` 후 Chrome에서 확인)
  - 단일 모드에서 폴더를 열고 닫을 수 있고, 항목을 클릭하면 시각화와 정보 카드가 바뀐다.
  - 비교 모드에서 슬롯 2 탭을 고른 뒤 클릭하면 오른쪽 트랙이 바뀌고, 1·2 배지가 맞게 나온다.
  - "힙"을 검색하면 힙 정렬 폴더가 펼쳐진다. "zzz"를 검색하면 안내 문구가 나온다. Esc를 누르면 검색이 지워진다.
  - 페이지를 스크롤해도 사이드바가 고정되어 있고, 폴더를 전부 펼치면 사이드바 안에서 스크롤된다.
  - 재생 중에 알고리즘을 바꾸면 처음 상태로 돌아간다(기존 동작).
  - 라이트·다크 테마 모두에서 확인한다.

- [ ] **Step 4: 커밋**

```bash
git add src/app/page.tsx src/views/home/ui/HomeView.tsx
git commit -m "feat: 홈 화면을 사이드바와 본문 두 칸 레이아웃으로 변경"
```
