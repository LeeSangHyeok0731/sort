// PreToolUse(Bash|PowerShell): blocks irreversible dangerous commands, git commands that dodge the settings.json deny rules by changing their form,
// direct commits on main, commits with a Claude co-author line, and commands that rewrite commit history (amend, rebase).
// Asks the user about read/check commands that write files (git diff/log/show --output, eslint --fix, etc.) and PRs that mix several kinds of work
import { ask, block, commandDirOf, git, readInput } from "./io.mjs";
import {
  dangerousCommand,
  forbiddenGit,
  gitOutputFile,
  hasClaudeCoauthor,
  historyRewrite,
  isGitCommit,
  isPrCreate,
  mainCommitTypes,
  prHeadBranch,
  toolWriteOption,
} from "./rules.mjs";

const input = await readInput();
const command = input.tool_input?.command ?? "";
// A subagent in a worktree commits on its own worktree branch, so look at the folder the command runs in
const dir = commandDirOf(input);

const danger = dangerousCommand(command);
if (danger) block(`Blocked a dangerous command (${danger}). If it is really needed, ask the user to run it themselves.`);

const forbidden = forbiddenGit(command);
if (forbidden) block(`Blocked a command on the deny list (${forbidden}). If it is really needed, ask the user to run it themselves.`);

const rewrite = historyRewrite(command);
if (rewrite) {
  block(`Existing commits are never modified (${rewrite}). Add the fix as a new commit (CLAUDE.md commit rules).`);
}

if (isGitCommit(command)) {
  const branch = git(dir, ["branch", "--show-current"])?.trim();
  if (branch === "main") block("Do not commit directly on main. Create a feature branch first (git switch -c <name>).");
  if (hasClaudeCoauthor(command)) {
    block("Do not put a Claude co-author line (Co-Authored-By: Claude) in commits. Remove that line and commit again.");
  }
}

const outputWrite = gitOutputFile(command);
if (outputWrite) {
  // ask() messages appear in the user's permission prompt, so they are in Korean (block() messages go to Claude and are in English)
  ask(`${outputWrite}는 결과를 파일에 써요. 조회 명령이라 허용 목록에 있지만 파일을 덮어쓸 수 있어 확인합니다. 실행할까요?`);
}

const toolWrite = toolWriteOption(command);
if (toolWrite) {
  ask(`${toolWrite}는 파일을 고치거나 써요. 검사 명령이라 허용 목록에 있지만 쓰기라 확인합니다. 실행할까요?`);
}

if (isPrCreate(command)) {
  const head = prHeadBranch(command) ?? "HEAD";
  const subjects = git(dir, ["log", "--no-merges", "--format=%s", `main..${head}`]);
  const types = subjects ? mainCommitTypes(subjects.split("\n").filter(Boolean)) : [];
  if (types.length > 1) {
    ask(
      `이 PR에 서로 다른 작업 커밋(${types.join(", ")})이 섞여 있어요. ` +
        "작업 하나당 브랜치·PR 하나가 규칙입니다(/parallel-tasks). 그래도 하나로 올릴까요?"
    );
  }
}
