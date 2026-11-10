# Architecture

The project follows Feature-Sliced Design (FSD). The rules in this document are checked in two places: `eslint.config.mjs` (`@/` alias imports, shown right in the editor) and `scripts/check-fsd.mjs` (`npm run lint:fsd`, relative paths and down to same-layer slices). Both run in CI.

## Layers

```
app → views → widgets → features → entities → shared
```

- Import only in the direction of the arrows. Lower layers do not know about upper layers. (ESLint, lint:fsd)
- Do not import another slice of the same layer. Example: `features/playback` does not import `features/sort-sound`. If both are needed together, compose them in an upper layer (`widgets`, `views`). (lint:fsd)
- Inside a slice, use relative paths (`../model/track`).

| Layer | Role | Contents |
|---|---|---|
| `app` | Next.js routes and global styles | `layout.tsx`, `page.tsx`, `globals.css` |
| `views` | Composes one page | Page state (URL sync, shortcuts), screen layout |
| `widgets` | Large screen blocks combining several features and entities | Visualization stage |
| `features` | One user action | Playback, algorithm selection, array settings, sound, theme toggle |
| `entities` | Domain data and its presentation | Sorting algorithms, arrays |
| `shared` | Shared code that knows no domain | `cn`, theme, palette, `Card`, the `ArrayItem` type |

## Public entry points

- Outside a slice, import only through `@/<layer>/<slice>` (that slice's `index.ts`). Importing an internal file directly (`@/features/playback/model/track`) is an ESLint error. If needed, export it from the index.
- There is one exception: **`@/entities/sort-algorithm/core`**. It is an entry point that imports no React or CSS, used by the Web Worker (`features/playback/model/sort.worker.ts`) and the modules the worker uses. `index.ts` exports `core` together with the UI components.
- `shared` has no slices and is imported by segment: `@/shared/lib`, `@/shared/ui`, `@/shared/model`, `@/shared/config`.

## File structure

```
src/
├─ app/
│  ├─ layout.tsx            # html, fonts, theme init script
│  ├─ page.tsx              # main margins (room for the fixed side bars) + HomePage
│  ├─ globals.css           # Tailwind, color tokens (light and dark), hidden scrollbars
│  └─ theme.test.ts         # theme class usage check (no old dark-only colors, dark: pairs)
├─ views/
│  └─ home/                 # home screen (the only page)
│     ├─ ui/HomePage.tsx    # loads HomeView client-only (no SSR because of randomness and the URL)
│     ├─ ui/HomeView.tsx    # layout of sidebar, playback bar, visualization and settings cards, plus page state
│     └─ model/
│        ├─ urlState.ts     # state ↔ URL query
│        ├─ slots.ts        # compare-mode slots → player slot setup
│        └─ useKeyboardShortcuts.ts
├─ widgets/
│  └─ visualizer/           # visualization stage (bar and structure views, code panel, stats)
│     ├─ ui/VisualizerStage.tsx
│     ├─ ui/structure/      # StructureView, TreeCanvas, BinsCanvas
│     └─ model/
│        ├─ structure.ts    # heap and BST node layout
│        ├─ orbit.ts        # animation paths for tree node swaps
│        └─ structures/     # scene (structure scene computation), trees, bins
├─ features/
│  ├─ playback/             # sort computation (worker) and playback
│  │  ├─ model/sortJob.ts        # runs one job (shared by the worker and the fallback path)
│  │  ├─ model/sort.worker.ts    # worker entry point
│  │  ├─ model/runInBackground.ts # worker pool (reuse, prewarming)
│  │  ├─ model/track.ts          # cursor that replays the op log forward and backward
│  │  ├─ model/useSortPlayer.ts  # playback state, speed, frame loop
│  │  └─ ui/                     # PlaybackBar, TrackStatsView, icons
│  ├─ select-algorithm/     # AlgorithmSidebar (folder tree), CompareToggle, AlgorithmOptions
│  ├─ configure-array/      # ArrayConfigurator (size, presets, manual input)
│  ├─ sort-sound/           # value → pitch, Web Audio synthesis, per-slot mute
│  └─ toggle-theme/         # ThemeToggle
├─ entities/
│  ├─ sort-algorithm/
│  │  ├─ core.ts            # public API without UI (for the worker)
│  │  ├─ index.ts           # core + AlgorithmInfoCard, CodePanel
│  │  ├─ algorithms/        # 58 algorithms, each xxxSort.ts + xxxSort.test.ts
│  │  ├─ model/
│  │  │  ├─ types.ts        # SortAlgorithm, SortOptions, SortResult
│  │  │  ├─ tracer.ts       # the only way algorithms touch the array; records ops
│  │  │  ├─ op.ts           # op log format (Int32Array) and applying it
│  │  │  ├─ run.ts          # runSort: run the algorithm → SortResult
│  │  │  ├─ code-lines.ts   # defineCode, //@label → line number
│  │  │  ├─ registry.ts     # ALGORITHMS list, AlgorithmId
│  │  │  ├─ families.ts     # sidebar folder (family) layout
│  │  │  └─ search.ts       # search by name, description, id
│  │  ├─ testing/sortSuite.ts # describeSortAlgorithm and other shared test helpers
│  │  └─ ui/                # AlgorithmInfoCard, CodePanel
│  └─ array/
│     ├─ lib/               # generate (per-preset generation and shuffling), parse (manual input)
│     ├─ model/constants.ts # size and value ranges, presets
│     └─ ui/                # ArrayBars (DOM, animation), CanvasBars (for many bars)
└─ shared/
   ├─ lib/                  # cn, theme (read, save, useTheme)
   ├─ ui/                   # Card
   ├─ model/                # ArrayItem type
   └─ config/               # PALETTE
```

## Sort pipeline

```
SortAlgorithm.sort(t)          entities/sort-algorithm/algorithms/*.ts
  → Tracer records ops          entities/sort-algorithm/model/tracer.ts
  → SortResult(ops: Int32Array) entities/sort-algorithm/model/run.ts, op.ts
  → computed in the worker pool features/playback/model/runInBackground.ts, sort.worker.ts, sortJob.ts
  → Track replays step by step  features/playback/model/track.ts, useSortPlayer.ts
  → drawn on screen             widgets/visualizer (bars: entities/array/ui, code lines: entities/sort-algorithm/ui/CodePanel)
  → sound                       features/sort-sound
```

- Sorting is recorded as an **op log**, not as array snapshots. The log is an `Int32Array` repeating `[type, a, b, line]`, passed from the worker to the main thread without copying (transfer).
- `line` is the explanation code line number that produced the op. The code panel highlight and per-line hit counts use it. The explanation code must match what is recorded, 1:1.
- There are four ops: Compare, Swap, Move and Mark (read).
- Algorithms whose op count explodes stop at `MAX_OPS` (3 million) and become `truncated`.

## Where to put a new file

| If the code is | Put it in |
|---|---|
| A UI piece or utility that knows no domain | `shared/ui`, `shared/lib` |
| Data, pure logic or presentation for sorting algorithms or arrays | `entities/<slice>` |
| One user action (a button or input and its state) | `features/<action>` |
| A screen block combining several features | `widgets/<block>` |
| Page layout, whole-page state | `views/<page>` |

Inside a slice, split by segment: `ui` (components), `model` (state and domain logic), `lib` (helpers), `config` (constants). The procedure for adding a new algorithm is in `.claude/skills/add-algorithm/SKILL.md`.

## Tests

- Tests go next to the target file as `*.test.ts`. Vitest runs in the node environment, so there are no DOM render tests. Move logic into `model`/`lib` to test it.
- Tests for the Claude Code hooks' decision logic are in `.claude/hooks/*.test.mjs`; tests for the FSD check script are in `scripts/*.test.mjs`.
- The worker bundle check (`scripts/check-worker-bundle.mjs`, `npm run check:worker`) runs after `npm run build` and scans `.next/static` to confirm that the sort worker was bundled as a JS chunk and that `new Worker` does not launch the `.ts` source. It exists to catch worker regressions that only show in production builds in CI. Its decision logic is tested in `scripts/check-worker-bundle.test.mjs`.
