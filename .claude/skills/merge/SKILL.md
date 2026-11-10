---
name: merge
description: Use to merge an opened PR into main ("머지해", "합쳐줘"). Runs only when the user has explicitly approved the merge. Check CI passed → merge with a merge commit → sync main and clean up the branch → report.
---

# Merge

Proceed only if the user approved **merging that PR** in this conversation. Approval to open a PR is not approval to merge. If any step fails, stop and report.

## 1. Check

```bash
gh pr view <number> --json state,mergeable,headRefName,title
gh pr checks <number>
```
- If the state is not `OPEN`, stop.
- If any check failed or is still running, stop. If running, wait with `--watch`.
- If there is a conflict (`mergeable: CONFLICTING`), bring the branch up to date with main as in step 3 and check CI again.

## 2. Merge

```bash
gh pr merge <number> --merge --delete-branch
```
- Merge with a merge commit. Do not squash or rebase-merge (CLAUDE.md commit rules).
- When merging several PRs, go one at a time, starting with those approved. After each merge, check the next PR's conflicts and CI again.

## 3. Update later branches (several PRs)

If a later PR conflicts after an earlier one is merged, merge main into that branch. Do not rebase (the hook blocks it).

```bash
git switch <later branch>
git pull --ff-only
git merge main
```
- Resolve the conflicts and finish with the merge commit instead of `/commit` (`git commit`, default message).
- Rerun `/verify` and push. Do not force push.

## 4. Clean up

```bash
git switch main
git pull --ff-only
git branch -d <branch>
```
- If `--delete-branch` already deleted the local branch, skip the last line.
- If worktrees remain, check with `git worktree list` and remove them (`/parallel-tasks` step 4).

## 5. Report

Tell the user, in Korean, the PR link, the merge commit hash (`git log -1 --format=%h`) and the CI result.
