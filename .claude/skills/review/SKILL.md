---
name: review
description: Use to get a branch that passed /verify reviewed before its PR ("리뷰해줘", "검토해 봐", or per branch in /parallel-tasks). Launches the reviewer agent, verifies each finding yourself, fixes only the valid ones in new commits, reruns /verify and reports.
---

# Review

The reviewer is a fresh pair of eyes that did not make the change. Its findings are not accepted without verification either.

## 1. Launch the reviewer

Launch `Agent` with `subagent_type: "reviewer"`. The reviewer only reads, so it is not isolated in a worktree. The prompt contains:

```
Branch: <branch name>
Working folder: <absolute path where that branch is checked out, or "none" if it is not checked out anywhere>
Purpose: <one line on what this work is meant to do>
Design/plan: <docs/specs/…, docs/plans/… paths, or "none">
Focus: <areas of concern, if any>
```

- The working folder is the path on that branch's line in `git worktree list`. The reviewer runs in the main folder, so without this path it reads and tests the files of whatever other branch is checked out there.
- With several branches (`/parallel-tasks`), launch one reviewer per branch in a single message.
- For a large change, the built-in `/code-review` can run alongside. It is better at general bugs; `reviewer` is better at this repo's rules.

## 2. Verify the findings

Open the code for each finding and classify it as one of three.

| Verdict | Criterion | Next |
|---|---|---|
| Accepted | You confirmed the problem in the code | Fix it in step 3 |
| Rejected | The finding is wrong (misread code, already handled, not a rule here) | Write the reason in one line |
| Out of scope | Correct but unrelated to this work | Do not fix; tell the user separately |

- Findings marked "needs checking" are resolved to accepted or rejected by reproducing them or running tests yourself.
- Even if the reviewer insists, reject it without evidence. If you were wrong, accept it.

## 3. Fix

- Fix accepted findings **in new commits** (`/commit`). Do not modify existing commits.
- One finding is one commit. Several findings with the same cause may share one commit.
- For a bug finding, follow the `/debug` order (failing test → confirm cause → fix).
- The commit prefix follows **the branch's main prefix**. A bug found by review on a `feat:` branch is fixed with `feat:`, not `fix:`, because it is part of that unmerged work. With `fix:`, `/pr` step 2 and the hook treat the work as mixed. Accompanying `test:`/`docs:`/`style:` stay as they are.

## 4. Check again

- After fixing, rerun `/verify`.
- If the fixes were large or changed the structure, run `/review` once more. If the second review still has a new "must fix", stop and settle the direction with the user.

## 5. Report

Report in Korean in this format:

```
- 리뷰어 의견: <머지해도 됨 / 반드시 고침 N개>
- 받은 지적: <문제 한 줄> → <고친 커밋 해시>
- 받지 않은 지적: <문제 한 줄> — <이유>
- 범위 밖: <문제 한 줄> (따로 처리 제안)
```

This goes into the "확인" section of the PR body in `/pr` as the "리뷰" item.
