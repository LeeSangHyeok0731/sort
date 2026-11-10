---
name: plan
description: Use to turn an approved design into an implementation plan ("계획 세워줘", right after /design is approved). Splits the design into commit-sized tasks, lists for each the files, the test to write first, the checks and the done condition, and writes it to docs/plans/. Does not write code.
---

# Implementation plan

`/implement` must be able to follow the plan as written. Write it so that someone who does not know this conversation, or a subagent, can tell what to do.

## 1. Prepare

- Re-read the approved design doc (`docs/specs/…-design.md`). Do not add to the plan anything that is not in the design.
- Read the files to change and the code around them, and use real file paths and function names. Do not write guessed paths.

## 2. Split into tasks

- Split so that **one task = one commit** (CLAUDE.md commit rules). If it can be described with one prefix and one Korean line, it is one task.
- Go bottom-up. By layer: `shared` → `entities` → `features` → `widgets` → `views`; by kind: data and logic first, UI last. After each task, the checks must pass.
- Logic tasks start with a test: failing test → confirm it fails → implement → confirm it passes.
- For UI tasks, write what to check in the browser (light and dark theme, desktop).
- Mark tasks as "independent" when they do not depend on each other and touch no shared files. Several independent tasks can be split out with `/parallel-tasks`.

## 3. Plan document

Write `docs/plans/YYYY-MM-DD-<english-name>.md` from the [template.md](template.md) skeleton, in Korean like the existing plans.
- Write shared constraints (desktop-only, Korean UI text, FSD rules, color tokens) once at the top.
- Write steps as checkboxes (`- [ ]`). `/implement` marks finished steps `- [x]`.
- Be concrete about test code and interfaces. For implementation code, only the essentials.

## 4. Wrap up

1. Make a `docs: <기능> 구현 계획` commit with `/commit`.
2. Show the user the task list (number, one-line summary, independent or not).
3. Once approved to proceed, move on to `/implement`. Also ask whether to split out the independent tasks.
