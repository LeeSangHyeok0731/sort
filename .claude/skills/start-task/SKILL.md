---
name: start-task
description: Use first when given a new task ("~ 만들자", "~ 고쳐줘", "~ 추가해줘", "이거 안 돼", "1, 2, 3 하자"). Check the working folder → update main → classify the task (small change, bug, new algorithm, large feature, several tasks) → create the work branch → hand off to the right skill.
---

# Start a task

A new task always starts on a work branch made from the latest main. This skill only goes as far as creating the branch and handing off to the next skill. It does not change code.

## 1. Working folder state

```bash
git branch --show-current
git status --short
git worktree list
```
- If there are uncommitted changes, stop and ask. Do not clear them away on your own with `git stash` or `git checkout -- <file>`.
  - On a work branch: the user decides whether to commit them on this branch (`/commit`) or keep them aside.
  - On main: you cannot commit on main (the hook blocks it). If the changes belong to this task, keep them in place, do the `git pull --ff-only` of step 2 (git stops if files overlap; report it then), and create the branch in step 4. The changes follow to the new branch. If they are unrelated to this task, ask what to do.
- If the current branch is not main, check whether it has commits not yet merged into main. It may already have been merged on the remote, so compare against the remote main.
  ```bash
  git fetch origin main
  git log --oneline origin/main..HEAD
  ```
  If there are commits, ask in one line whether this continues that work or is a new task. **If it continues**, skip step 2 (update main) and step 4 (create branch), and go straight to step 5 after classifying in step 3.
- If worktrees remain, mention them. Do not remove them (they are cleaned up in `/parallel-tasks` steps 4 and 6).

## 2. Update main

```bash
git switch main
git pull --ff-only
```
- If `--ff-only` fails, the local main has commits not on the remote. Stop and report. Do not reconcile with `git reset --hard` or rebase.

## 3. Classify

Read the request and skim the related code (see "Where to put a new file" in `docs/ARCHITECTURE.md`), then pick one of these.

| Kind | Criterion | Skill to hand off to | Branch |
|---|---|---|---|
| Small change | A few files, one layer, no new state, obvious approach | `/implement` | `feat/…`, `style/…`, `refactor/…`, `docs/…`, `ci/…`, `chore/…`, etc. |
| Bug | Behaves differently than expected, failing test | `/debug` | `fix/…` |
| New algorithm | Add one sorting algorithm to the list | `/add-algorithm` | `feat/<name>-sort` |
| Large feature | Touches several layers, new screen/state/dependency, or room to choose an approach | `/design` → (approval) → `/plan` → `/implement` | `feat/…` |
| Several tasks | Two or more independent requests | `/parallel-tasks` | Created there, one per task |

- If unclear, do not pick on your own; ask in one line. Never move on without asking.
- If it is unclear between a small change and a large feature, put the large feature first as the recommendation when asking. Starting without a design and heading the wrong way costs more to undo. Example: "단축키 설정 화면까지 만드는 큰 기능으로 보고 설계부터 할까요(추천), 단축키 하나만 더하는 작은 수정으로 볼까요?"
- For several tasks, do not create a branch here; hand off to `/parallel-tasks` directly.

## 4. Create the branch

```bash
git switch -c <prefix>/<short-english-name>
```
- The prefix is the same as this task's main commit prefix (`feat`, `fix`, `perf`, `refactor`, `style`, `docs`, `chore`, `ci`). Use `test` only for work that only adds tests (`test/…`). Tests that belong to other work follow that work's prefix.
- The name is short, lowercase English with `-`. Examples: `fix/seek-end-stutter`, `feat/shell-sort-variant`, `ci/rename-workflow`.
- If a branch with the same name exists (`git branch --list <name>`), stop and ask whether to continue on it or use another name.
- Run the branch-creating command and the first `git commit` separately. The hook looks at the branch before the command runs (main) and blocks the commit.

## 5. Hand off

Announce the classification in one line (in Korean) and move straight on to that skill.

```
작은 수정(한 컴포넌트의 색 토큰 교체)으로 보고 style/progress-bar-color 브랜치를 만들었습니다. /implement로 진행합니다.
```
- A large feature goes to `/design`; do not write code before the design is approved. Whether the design doc gets its own PR or stays on the implementation branch is asked of the user in the last step of `/design`.
- If the classification turns out wrong during the work (thought it was a small change, but an approach must be chosen), stop, say so, and move to the right skill.
