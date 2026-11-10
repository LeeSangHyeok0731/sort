---
name: parallel-tasks
description: Use when given two or more separate tasks at once (e.g. "1, 2, 3 고치자", parallel work with several subagents). Creates a separate branch from main per task, splits the work across worktree subagents, and opens a separate PR per task.
---

# One branch and one PR per task

Even when given several tasks together, **one task = one branch = one PR**. Do not split commits within one branch and bundle them into one PR. If commit prefixes are mixed when a PR is created, the `guard-command.mjs` hook asks the user.

## 1. Split the tasks

- Name each task's branch `<prefix>/<short-name>` (e.g. `ci/build-check`, `fix/sort-error-status`). The prefix is the same as that task's commit prefix.
- If tasks need to change the same files, doing them separately causes merge conflicts. Ask the user whether to combine such tasks or do them in order.
- If a large feature is among them, that task starts with a design document per the CLAUDE.md rules.

## 2. Launch the workers

For each task, launch `Agent` with `subagent_type: "worker"` and `isolation: "worktree"`. If they do not depend on each other, launch them together in one message. Each worker works in its own copy under `.claude/worktrees/`, so they do not overwrite each other's files in a shared folder.

The common rules (nothing outside the worktree, aligning the branch, the `/implement` and `/commit` procedures, checks, no push/PR, report format) are in the worker definition (`.claude/agents/worker.md`). The prompt contains only what is specific to the task.

```
Branch: <prefix>/<short-name>
Goal: <what and why; the condition for calling it done>
Scope: <files and folders to change, files not to touch>
References: <related code locations, design/plan doc paths, or "none">
```

- The worker does not know this conversation. Write the prompt so it can work from the prompt alone.
- A worktree has no `node_modules`. Node still walks up the folders and finds the project root's `node_modules`, so lint, lint:fsd, typecheck and vitest run as usual (verified).
- The worker's branch alignment (`git branch -m`, `git switch -c`) is not in the permission allowlist, so a confirmation prompt appears. Approve it once per task.

## 3. Review (while the worktree exists)

Do not just trust the worker's report; check each branch yourself.

1. Look at the diff.
   ```bash
   git worktree list
   git diff main...<branch> --stat
   git diff main...<branch>
   ```
2. Run `/review` for each branch. The working folder is the path on that branch's line in `git worktree list`. With several branches, launch the reviewers together in one message.
3. Fix accepted findings in new commits inside that worktree. Edit files by their absolute worktree paths. For the commit, run `cd <worktree path>` **separately first**, then commit in the next command. The hook checks the branch in the shell folder before the command runs, so chaining `cd … && git commit` in one command makes it see the main folder's branch (main) and block. Do not use `git -C <path> commit`: the hook does not recognize it as a commit, so the main and co-author checks are skipped.
4. The "rerun `/verify` after fixing" of `/review` step 4 is not done here. Builds are not run in a worktree, so it is done after moving to the main folder in step 4 of this skill. Unlike the usual order (`/verify` → `/review`), review comes first here.

## 4. Check in the main folder

The build is checked only in the main folder (`npm run build` has never been tried in a worktree). The same branch cannot be checked out in two folders at once, so **remove the worktree first**, then switch to that branch in the main folder. Removing the worktree keeps the branch and its commits.

```bash
git worktree remove <worktree path>
git switch <branch>
```
- If the shell is inside that worktree, it cannot be removed. Leave to the main folder first.
- If uncommitted changes remain, `git worktree remove` stops. Do not remove it with `--force`; look at what the changes are and ask the user whether to commit them.
- Run `/verify` on that branch. Do one branch at a time.

## 5. Ship

- Push, PR and merge only after the user approves. Run `/pr` **separately** per branch to open the PRs one by one.
- Merge the approved PRs one at a time with `/merge`. If a later branch conflicts after an earlier PR is merged, bring it up to date with `git merge main` as in `/merge` step 3. The hook blocks rebase, and the permission settings and hook block force push.
- When reporting to the user, list the PR links per task.

## 6. Clean up

- Worktrees that finished with no changes are removed automatically. Check for the rest with `git worktree list` and remove them as in step 4.
