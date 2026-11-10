---
name: pr
description: Use to push a work branch and open a PR ("PR 올려줘", "push해"). Runs only when the user has approved push/PR. Goes branch and mixed-work check → /verify and /review check → dev log entry → push → PR → CI check, and does not merge (/merge).
---

# Open a PR

Proceed only if the user approved push or PR in this conversation. If any step fails, stop right there and report it with the output. Do not work around anything (`--no-verify`, force push, skipping checks).

## 1. Check the branch

```bash
git branch --show-current
git status --short
git log --oneline main..HEAD
```
- If it is `main`, stop.
- If there are uncommitted changes, stop and ask whether to commit them (`/commit`).
- If it is `docs/perf-benchmark`, just `git push` and finish. This branch gets no PR, no merge and no dev log entry.

## 2. Is the work mixed?

Look at the prefixes in `git log --oneline main..HEAD`.
- If commits from different kinds of work are mixed (like `feat` and `ci`), stop and ask whether to split (`/parallel-tasks`).
- Accompanying `test:`/`docs:`/`style:` commits do not count as mixed.
- The hook checks the same thing at `gh pr create` and asks.

## 3. Checks

- Run `/verify`. If it already ran and no commits were added since, you may skip it. If skipped, say so in the PR body.
- Check whether `/review` was done. If not, **stop here**, run `/review`, report the review result and the fix commits, and get push/PR approval again. The user must approve after seeing the review result.
- The review is checked before the dev log so that the dev log entry covers the review fix commits too.
- Review may be skipped only for a PR whose changed files are just `DEVELOPMENT_LOG.md` and `README.md`. If any other file changed, review it. Rule documents loaded by `CLAUDE.md` such as `docs/ARCHITECTURE.md`, `docs/specs/`/`docs/plans/`, and `.claude/` (skills, agents, hooks) are all reviewed. If skipped, say so in the PR body.

## 4. Dev log entry

Write one entry for this PR in `DEVELOPMENT_LOG.md`, in Korean. One PR, one entry. Write it after the checks (step 3). A commit that only adds the dev log does not need `/verify` again.

1. Look at the end of the file: `grep -n "^## \|^### [0-9]*\.\|마지막 업데이트" DEVELOPMENT_LOG.md | tail -5`
2. If the last date header (`## 📅 YYYY. MM. DD …`) is not today, add today's date header before the last `---`. Put `---` between date sections.
3. Write the entry with the next number after the last one.

   ```markdown
   ### N. <이모지> <제목>

   - 무엇을, 왜 바꿨는지 (3~6줄 목록)
   - 사용자에게 보이는 변화가 있으면 그것부터
   ```
4. Change `_마지막 업데이트: YYYY-MM-DD_` at the end of the file to today.
5. Commit with `/commit` as `docs: 개발 로그에 <제목> 추가`.

## 5. Push and PR

```bash
git push -u origin <branch>
```

Write the PR body in Korean in the `.github/pull_request_template.md` format, to a file in the temp folder (scratchpad), and pass the file. This avoids shell quoting problems.

```bash
gh pr create --base main --head <branch> --title "<prefix>: <한국어 한 줄>" --body-file <body file>
```
- The title follows the commit convention. With a single commit, use its subject.
- "변경 내용" says what changed and why. "확인" carries the `/verify` report and the `/review` result (accepted and rejected findings).
- Do not add a "Generated with Claude Code" line at the end of the body (`attribution.pr: ""`).
- If the hook asks about mixed work, follow the user's answer.

## 6. Check CI

```bash
gh pr checks <number> --watch --interval 20
```
- Right after creating the PR there may be no checks yet ("no checks reported"). Wait a moment and look again.
- `Lint · Typecheck · Test` is a required check in the main ruleset; it must pass to merge. Look at the Vercel preview too.
- If it fails, report the cause, fix it in a new commit and push (`/commit`).

## 7. Report

Tell the user the PR link, the CI result and the dev log number. **Do not merge.** Merging is done with `/merge` after the user approves.
