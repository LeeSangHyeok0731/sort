---
name: commit
description: Commit when one unit of work on a branch is done ("커밋해줘", "변경 저장해", or after finishing one task during implementation). Check changes → stage only this unit's files → run related checks → commit with a prefix and a Korean message. Does not push.
---

# Commit

The source of truth is "Commit rules" in CLAUDE.md. This skill only lists the steps for committing by those rules.

## 1. Check the branch

```bash
git branch --show-current
```
- If it is `main`, stop. Create a work branch first (`git switch -c <prefix>/<name>`). The hook also blocks commits on main.
- Do not chain a branch switch and a commit in one command (`git switch -c x && git commit`). The hook looks at the branch before the command runs, so it blocks it. Run them separately.

## 2. Check the changes

```bash
git status --short
git diff
git diff --cached
```
- Leave changes unrelated to this unit out of the commit. They may be the user's, so do not revert them; mention them in the report.
- If two or more units are mixed, commit each separately (repeat steps 3–6 per unit). Test: can it be described with one prefix and one Korean line? If the description needs "A and also B", split it.

## 3. Stage

```bash
git add <file> <file> ...
```
- Name files explicitly. Do not use `git add -A` or `git add .`.
- Review the staged list with `git diff --cached --stat`. Make sure none of these slipped in:
  - `.env*`, `.claude/settings.local.json`, build output (`.next/`), temp files
- Tests for this unit go in the same commit.

## 4. Checks

Run what matches the files in this commit.

| Changed | Run |
|---|---|
| under `src` | related tests (`npx vitest run <folder>`), `npm run typecheck`, `npx eslint <file>` |
| `.claude/hooks`, `scripts` | `npx vitest run .claude/hooks` or `npx vitest run scripts` |
| docs only | nothing |

If something fails, do not commit; fix it. The full check runs in `/verify`.

## 5. Message

The message is written in **Korean**.

```
<prefix>: <what was done, one Korean line>

<optional: why it was done this way>
```
- The prefix is one of `feat` `fix` `perf` `refactor` `style` `test` `docs` `chore` `ci`.
- The subject states the result. Example: `fix: 슬라이더에 포커스가 있어도 Space 단축키 동작`. Do not write only "수정함" or "업데이트".
- For a bug fix, state the cause in one line in the body.
- Do not add a Claude co-author line (`Co-Authored-By: Claude …`). The hook blocks it.
## 6. Commit

```bash
git commit -m "<subject>" -m "<body>"
git log -1 --format='%h %s'
```
- Do not push. Push and PR happen in `/pr` after the user approves.
- **Never modify a commit that already exists.** Mistakes, forgotten files and review fixes go in new commits. A commit that fixes this branch's own unmerged work (such as a review fix) uses the branch's main prefix (`feat:`, not `fix:`, on a `feat:` branch). The hook blocks `git commit --amend` and `git rebase`.
- If the hook blocks you, fix what its message says and commit again. Do not get around the hook (`--no-verify`, etc.).

## 7. Report

Tell the user, in one line, the commit hash, subject and number of files. Mention any changes left out of the commit.
