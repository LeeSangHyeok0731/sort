// Stop: src에 변경이 있으면 타입 검사를 돌리고, 실패하면 Claude가 이어서 고치게 한다
import { spawnSync } from "node:child_process";
import { block, projectDirOf, readInput, runNodeBin } from "./io.mjs";
import { hasSrcChanges } from "./rules.mjs";

const input = await readInput();
// 이미 Stop 훅 때문에 이어서 작업 중이면 다시 막지 않는다 (무한 반복 방지)
if (input.stop_hook_active) process.exit(0);

const projectDir = projectDirOf(input);
const status = spawnSync("git", ["status", "--porcelain"], { cwd: projectDir, encoding: "utf8" }).stdout ?? "";
if (hasSrcChanges(status)) {
  const r = runNodeBin(projectDir, "node_modules/typescript/bin/tsc", ["--noEmit"]);
  if (r.status !== 0) block(`타입 검사 실패:\n${r.output.trim().split("\n").slice(0, 30).join("\n")}`);
}
