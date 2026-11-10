// Stop: if src has changes, run the type check; if it fails, make Claude continue and fix it
import { spawnSync } from "node:child_process";
import { block, projectDirOf, readInput, runNodeBin } from "./io.mjs";
import { hasSrcChanges } from "./rules.mjs";

const input = await readInput();
// If already continuing because of this Stop hook, do not block again (prevents an endless loop)
if (input.stop_hook_active) process.exit(0);

const projectDir = projectDirOf(input);
const status = spawnSync("git", ["status", "--porcelain"], { cwd: projectDir, encoding: "utf8" }).stdout ?? "";
if (hasSrcChanges(status)) {
  const r = runNodeBin(projectDir, "node_modules/typescript/bin/tsc", ["--noEmit"]);
  if (r.status !== 0) block(`Type check failed:\n${r.output.trim().split("\n").slice(0, 30).join("\n")}`);
}
