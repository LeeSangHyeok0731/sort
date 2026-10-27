// PreToolUse(Bash|PowerShell): main 브랜치에서 직접 커밋하지 않게 막는다
import { spawnSync } from "node:child_process";
import { block, projectDirOf, readInput } from "./io.mjs";
import { isGitCommit } from "./rules.mjs";

const input = await readInput();
if (isGitCommit(input.tool_input?.command ?? "")) {
  const branch = spawnSync("git", ["branch", "--show-current"], {
    cwd: projectDirOf(input),
    encoding: "utf8",
  }).stdout?.trim();
  if (branch === "main") block("main 브랜치에는 직접 커밋하지 않아요. 기능 브랜치를 먼저 만드세요 (git switch -c <이름>).");
}
