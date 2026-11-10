---
name: verify
description: Use before saying work is done and before opening a PR ("확인해줘", "다 됐어?", or when implementation is finished). Runs the same checks as CI in the same order, checks the browser if the UI changed, and reports the result with evidence.
---

# Check before done

Say "done" only after seeing the check results. Before that, do not say "it should be done".

## 1. What to check

```bash
git status --short
git log --oneline main..HEAD
git diff main...HEAD --stat
```
- If there are uncommitted changes, `/commit` first. Checks run against the committed state.

## 2. Checks (same order as CI)

```bash
npm run lint && npm run lint:fsd && npm run typecheck && npm test && npm run build && npm run check:worker
```
- This is the same order as `.github/workflows/ci.yml`. If the CI steps change, update this list too.
- If one fails, stop there. Report the failing command and the key lines of its output, then fix it. Fixes go in a new commit (`/commit`).
- Read the test count from the `Tests N passed` line of `npm test` and report it as is.
- If the build emits stale CSS, it may be the Turbopack cache. See "Things to know" in CLAUDE.md.

## 3. UI check (only if the UI changed)

If `ui` files under `src`, `globals.css`, or playback/visualization behavior changed, look at it in the browser.

1. Start `npm run dev` in the background and open `http://localhost:3000`.
2. Actually exercise the changed behavior. Pick what is affected: play, step, progress bar, compare mode, etc.
3. Check both the light and the dark theme (the button next to the title).
4. Check the browser console for errors.
- Desktop only. Do not check mobile widths.
- If no browser is available, skip the UI check and say it was skipped.
- Stop the dev server when done.

## 4. Report

Report in this format, in Korean. It goes into the "확인" section of the PR body in `/pr` as is.

```
- lint, lint:fsd, typecheck, 테스트 N개, build, check:worker 통과
- 브라우저: (확인한 동작, 테마) / 확인하지 않음 (이유)
- 확인하지 못한 것: (있으면)
```
- If any failure remains, do not call it "done".
- If a check was skipped, say so. Do not hide it.
- Results a subagent reported as "passed" are re-run and confirmed here.
