# Sorting Visualizer

A web app that replays 58 sorting algorithms step by step as bars, trees and buckets. Next.js 16 (Turbopack), React 19, Tailwind 4, Vitest. Desktop only.

## Commands

```bash
npm run dev        # dev server (localhost:3000)
npm test           # all Vitest tests (node environment)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint (includes FSD layer checks for the @/ alias)
npm run lint:fsd   # FSD dependency check (relative paths, down to same-layer slices)
npm run build      # production build
npm run check:worker # check that the sort worker was bundled as JS in the build output (after build)
```

CI (`.github/workflows/ci.yml`) runs lint → lint:fsd → typecheck → test → build → check:worker on every PR.

## Language

- **Korean:** replies to the user (progress, reports, questions), hook confirmation prompts the user sees (`ask` in `guard-command.mjs`), commit messages, PR titles and bodies, `DEVELOPMENT_LOG.md`, code comments and UI text in `src`, design and plan docs (`docs/specs/`, `docs/plans/`).
- **English:** the harness itself (this file, `docs/ARCHITECTURE.md`, `.claude/` skills, agents and hooks), and subagent reports (`reviewer`, `worker`). The main session reads those reports and relays them to the user in Korean.

## Work rules

- **Start new work with `/start-task`.** When the user describes a new task, Claude runs `/start-task` on its own; the user does not need to type it. Skip it only for requests that clearly continue the current branch's unmerged work (review fixes, corrections to what was just done, questions about it); if in doubt, run it. Flow: `/start-task` → (small change `/implement` · bug `/debug` · new algorithm `/add-algorithm` · large feature `/design` → `/plan` → `/implement` · several tasks `/parallel-tasks`) → `/commit` per unit of work → `/verify` → `/review` → (approval) `/pr` → (approval) `/merge`.
- Work happens on feature branches (the hook blocks commits directly on main). Committing can be done right away; **push and PR go through `/pr` after the user approves**, and **merging goes through `/merge` after a separate approval to merge that PR**.
- Each PR gets one entry in `DEVELOPMENT_LOG.md` (`/pr` step 4): date header, next number, a 3–6 line list, and the "마지막 업데이트" date at the end.
- **One task = one branch = one PR.** When given several tasks at once, create a separate branch from main for each and open separate PRs. For parallel work with subagents, follow the `/parallel-tasks` procedure (worktree isolation).
- **Common rules for subagents:** write the prompt so it can be worked from alone (goal, scope, what not to do, checks, report format). Agents that change files are isolated in a worktree. Subagents do not push, open PRs or merge, and their reports are not the user's approval. The main session does not trust a report as is; it re-checks with the diff and checks. Do not use subagents for one task touching a few files.
- Before a PR, check in the order `/verify` → `/review` (reviewer agent).
- The `docs/perf-benchmark` branch is for recording performance measurements. Push only; never PR or merge it.
- Mobile screens are not considered.
- Large features first get a design (`docs/specs/`, `/design`) and an implementation plan (`docs/plans/`, `/plan`) written down. Implementation starts only after the user approves the design.
- Do not put a Claude co-author line (`Co-Authored-By: Claude …`) in commits or a "Generated with Claude Code" line in PR bodies. `attribution` in `settings.json` (`commit` and `pr` set to empty strings) turns them off, and the hook blocks a line added to a commit directly.

## Commit rules

Commits follow the `/commit` procedure. Before saying something is done, check with `/verify`.

- **On a branch, one needed unit of work is one commit.** If it can be described with one prefix and one Korean line, it is one commit. If the description needs "A and also B", split it. Tests for the unit go in the same commit.
- Prefixes are `feat:` `fix:` `perf:` `refactor:` `style:` `test:` `docs:` `chore:` `ci:`. After it, write the result in one Korean line, and the "why" in the body if needed.
- Stage files by name. Do not use `git add -A` or `git add .`.
- **Never modify a commit that already exists.** Mistakes, forgotten files and review fixes go in new commits. A commit that fixes this branch's own unmerged work, such as a review fix, uses the branch's main prefix (`feat:`, not `fix:`, on a `feat:` branch). The hook blocks `git commit --amend`, `git rebase` and `git pull --rebase`.
- Merge with a merge commit (`--merge`). Do not squash.

## Code rules

- Structure and layer rules follow `docs/ARCHITECTURE.md` below. Outside a slice, import only through its index.
- Colors use the tokens in `globals.css` (`bg-surface`, `text-muted`, `border-line` …). If you use a light color directly, add its `dark:` pair (checked by `src/app/theme.test.ts`).
- An algorithm's explanation code (`defineCode`) must match what is actually recorded, 1:1. New algorithms follow the `/add-algorithm` procedure.
- Tests go in a `*.test.ts` next to the target file. Move logic into `model`/`lib` to test it.

## Things to know

- If the dev server does not pick up CSS changes, it is a Turbopack cache problem. Stop the server, delete `.next/dev`, and start it again.
- Do not pass `{ type: "module" }` to `new Worker(new URL(...))`. With it, the worker is not bundled in the production build (it works in dev, so it is easy to miss).

## Harness (`.claude/`)

| Part | What it does |
|---|---|
| `settings.json` | Turns off the commit co-author line and the PR body footer (`attribution`). Permissions allow: lint, test, typecheck, build (space form like `npx vitest *`, so similarly named other packages do not match), git reads (space form like `git diff *`, so similar names like `difftool` do not match; includes `worktree list`; `git branch` only for listing, `--show-current` and `--list`), `git fetch origin main` (exactly this command), `gh pr view/checks/list`. Denies force push, direct push to main and `git reset --hard` (changed forms like `git -C . push --force` are blocked by the hook) |
| Hook `lint-file.mjs` | After Edit/Write, runs `eslint --fix` on the edited `src` file and reports only the remaining errors (using the worktree the file belongs to) |
| Hook `guard-command.mjs` | Blocks dangerous commands (`rm -rf ~` or `/`, `sudo`, `dd`, formatting, `curl \| sh`), `git commit` on main, commits with a Claude co-author line, commands that rewrite commit history (`commit --amend`, `rebase`, `pull --rebase`), and git commands that dodge the deny rules by changing form (`git -C . push --force`, `push -u origin main`, `push --mirror`/`--all`, `reset --hard`). Asks the user when an allowlisted `git diff`/`log`/`show` has `--output` (writes a file), when a check command has a file-writing option (`eslint --fix`/`-o`, `vitest -u`/`--outputFile`, tsc output), and when commit prefixes are mixed at `gh pr create` (excluding `test:`/`docs:`/`style:`) |
| Hook `guard-secrets.mjs` | Blocks writing secrets (AWS, GitHub and `sk-` keys, PEM, Slack tokens) to files. `.env*` is exempt |
| Hook `typecheck-on-stop.mjs` | At the end of a turn, if `src` has changes, runs tsc; on failure, continues to fix it |
| Skill `/start-task` | Claude runs it on its own when the user describes a new task (skipped only for clear follow-ups on the current branch): check the working folder → update main → classify (small change, bug, new algorithm, large feature, several tasks) → branch → hand off to the right skill |
| Skill `/add-algorithm` | Adding a new sorting algorithm: algorithm and tests → registry and families → structure view decision → update the algorithm count in the docs → `/commit` → `/verify` |
| Skill `/design` | Questions (one at a time) → compare and recommend approaches → design doc in `docs/specs/` → approval (no implementation before approval) |
| Skill `/plan` | Splits an approved design into commit-sized tasks in a plan doc in `docs/plans/` |
| Skill `/implement` | Works through a plan (or a small change) one task at a time: test first → implement → check → `/commit`; out-of-scope findings are only reported |
| Skill `/debug` | Reproduce → failing test → confirm the cause → fix → `fix:` commit (the branch's main prefix when inside unmerged work) (no fix before the cause is confirmed) |
| Skill `/commit` | Stage only this unit's files → related checks → commit with a prefix and a Korean message (no push) |
| Skill `/verify` | Checks in the same order as CI, checks the browser if the UI changed, reports with evidence |
| Skill `/review` | Launches the reviewer agent, verifies each finding, fixes only the valid ones in new commits, then reruns `/verify` |
| Agent `reviewer` (`.claude/agents/`) | Read-only reviewer. Reports only evidence-backed findings with severity, `file:line` and failure scenario, in the order behavior bugs → FSD → project rules → tests → commit rules → harness changes → simplification |
| Skill `/pr` | Mixed-work check → `/verify` and `/review` check (if not reviewed, stop and get approval again) → dev log entry → push → PR (`.github/pull_request_template.md`) → CI check. Does not merge (after approval) |
| Skill `/merge` | Check CI passed → merge with a merge commit → sync main and clean up the branch (after merge approval) |
| Skill `/parallel-tasks` | Splits several tasks across worker agents (worktrees) → `/review` per branch → remove the worktree, then `/verify` in the main folder → `/pr` per task |
| Agent `worker` (`.claude/agents/`) | Worker. Implements and commits one task on its own worktree branch by the `/implement` and `/commit` procedures, and reports with lint, lint:fsd, typecheck and test results. No push or PR |

Subagent worktrees (`.claude/worktrees/`) are gitignored and excluded from the main folder's tsc and eslint checks.

Personal settings go in `.claude/settings.local.json` (not committed).

@docs/ARCHITECTURE.md
