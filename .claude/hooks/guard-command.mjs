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
  ask(`${outputWrite} writes its output to a file. It is a read command on the allowlist, but it can overwrite files, so confirming. Run it?`);
}

const toolWrite = toolWriteOption(command);
if (toolWrite) {
  ask(`${toolWrite} modifies or writes files. It is a check command on the allowlist, but this is a write, so confirming. Run it?`);
}

if (isPrCreate(command)) {
  const head = prHeadBranch(command) ?? "HEAD";
  const subjects = git(dir, ["log", "--no-merges", "--format=%s", `main..${head}`]);
  const types = subjects ? mainCommitTypes(subjects.split("\n").filter(Boolean)) : [];
  if (types.length > 1) {
    ask(
      `This PR mixes commits from different kinds of work (${types.join(", ")}). ` +
        "The rule is one branch and one PR per task (/parallel-tasks). Open it as one PR anyway?"
    );
  }
}
