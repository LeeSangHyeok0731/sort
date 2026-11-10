---
name: debug
description: Use to fix a bug, a failing test, or unexpected behavior ("이거 버그야", "안 돼", "테스트가 깨져", "멈칫해"). Goes reproduce → failing test → confirm the cause → fix the cause → /commit, and does not fix anything before the cause is confirmed.
---

# Debug

Fix the cause, not a patch that hides the symptom. Do not change code before the cause is confirmed.

## 1. Reproduce

- If you are on main or on another task's branch unrelated to this bug, create a `fix/…` branch with `/start-task` first. If you are fixing a bug in this branch's own unmerged work (e.g. a `/review` fix), stay on that branch.
- Write down the reproduction: with which input and settings, doing what, what should appear and what appears instead.
- For a UI problem, start `npm run dev` and reproduce it yourself. Fixing the state with URL query parameters (`?algo=…&size=…`) makes it easier.
- For a performance problem, measure first (elapsed time, op count). Do not start from "it feels slow".
- If it does not reproduce, stop and ask the user for more information, along with what you have tried.

## 2. Failing test

- If possible, turn the reproduction into a test. **Confirm that the test fails.**
- If the logic is tied up inside a `ui` component and cannot be tested, moving it into `model`/`lib` is part of this work. In that case make a behavior-preserving `refactor:` commit first.
- If the problem cannot be tested (browser APIs, visual effects), leave the reproduction steps in the report.

## 3. Cause

- Form one hypothesis: "Y happens because of X".
- **Confirm** it: print values, inspect intermediate state, change a condition and see whether the result follows. Do not fix based on an unconfirmed hypothesis.
- Remove temporary output used for confirming (`console.log`, etc.) before fixing.
- **If a hypothesis is wrong twice, stop.** Report the facts confirmed so far and the hypotheses ruled out, and ask the user for direction.
- Common places to look
  - Playback: `features/playback/model/track.ts` (applying ops, rewinding), `useSortPlayer.ts` (state, frame loop)
  - Computation: `runInBackground.ts` (worker pool), `sortJob.ts`
  - Op recording: `entities/sort-algorithm/model/tracer.ts`, `op.ts`
  - Worker problems that only appear in production: `npm run build && npm run check:worker`

## 4. Fix

- Fix the confirmed cause. Do not just block the symptom (swallowing exceptions, skipping only the special case).
- Check that the test from step 2 passes, and also run all related tests and `npm run typecheck`.
- Look for the same cause elsewhere (`Grep`). If found, ask the user whether to fix it in this work too.

## 5. Commit and report

- Make a `fix:` commit with `/commit`. When fixing this branch's own unmerged work (e.g. a `/review` fix), use the branch's main prefix (`feat:`, etc.). State the cause in one line of the body (in Korean). Example: "원인: 슬라이더 포커스 중에는 INPUT이라 단축키를 모두 건너뛰었다."
- Report (in Korean): reproduction, cause, what was fixed, tests added, what could not be checked.
- Then move on to `/verify`.
