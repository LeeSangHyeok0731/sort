---
name: implement
description: Use to implement a plan (docs/plans/) or a small change directly ("구현해줘", "계획대로 진행해", right after /plan is approved, a change of a few files). Repeats read code → (for logic) failing test → implement → check → /commit → update checkbox, one task at a time, then hands off to /verify.
---

# Implement

If there is a plan, follow it as written. For a small change with no plan, use the steps below as the plan.

## 0. Before starting

- Check that you are on a work branch (`git branch --show-current`). If it is main or another task's branch, create a branch with `/start-task` first (one task = one branch).
- If there is a plan document, read it start to finish. Skip steps already marked `- [x]`.
- If the plan and the code differ (a file is missing, a function has another name), do not fill the gap with guesses. Tell the user what differs and ask whether to change the plan.

## 1. One task at a time

One task is one commit (CLAUDE.md commit rules). Finish the current task through its commit before moving on.

1. **Read:** read the files to change and the places that use them. Check the layer and the public entry point (`index.ts`).
2. **Test first (for logic):** logic in `model`/`lib` starts with a failing test.
   - **Confirm it fails** with `npx vitest run <test file>`. If it passes from the start, the test verifies nothing; fix the test.
   - UI (`ui`) code is not render-tested because the environment is node. Move the logic to `model`/`lib` and test it there.
3. **Implement:** write just enough to pass the test.
   - Follow the FSD layer direction and the no-same-layer-slice-import rule. Outside a slice, import only through its index.
   - Use color tokens; if you use a light color directly, add its `dark:` pair.
   - Keep algorithm explanation code (`defineCode`) 1:1 with what is actually recorded.
   - Write code comments and UI text in Korean.
4. **Check:** run the related tests, `npm run typecheck` and `npx eslint <file>`. The lint hook runs `eslint --fix` on every save and reports remaining errors.
5. **Commit:** `/commit`. Use the message written in the plan.
6. **Checkbox:** mark that task's step in the plan as `- [x]`. Do not fold this into the next task's commit; commit the plan document alone as `docs:`. Updating several checkboxes at the end in one go is fine.

## 2. When stuck

- If a test fails unexpectedly or an error's cause is unknown, go to `/debug`. Do not change things at random without knowing the cause.
- If there is a reason not to follow the plan (conflicts with the design, a better way found), stop and ask the user. If the plan changes, update the plan document in a new commit.

## 3. Scope

- If you find an improvement or bug not in the plan, do not fix it; note it. Report it separately at the end.
- If refactoring is truly needed, do not mix it with the feature commit; make a separate `refactor:` commit first.

## 4. Done

When every task is committed, move on to `/verify`. The report (in Korean) includes:
- the list of commits
- where the work differed from the plan
- what was found but not fixed
