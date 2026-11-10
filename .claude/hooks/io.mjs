import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** Read the hook input (stdin JSON) */
export async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

/** The project root the hooks work from */
export function projectDirOf(input) {
  return process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
}

/**
 * The folder the command actually runs in. A subagent working in a worktree runs commands in its own worktree,
 * not the project root, so the branch is checked from this folder
 */
export function commandDirOf(input) {
  return input.cwd ?? projectDirOf(input);
}

/** Root of the git working tree (worktrees included) that dir belongs to; null outside git */
export function repoRootOf(dir) {
  if (!dir || !existsSync(dir)) return null;
  const r = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd: dir, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

/** Run a git command in dir and return its stdout; null on failure */
export function git(dir, args) {
  const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  return r.status === 0 ? r.stdout : null;
}

/**
 * Walk up from dir looking for binPath (node_modules/...).
 * A worktree has no node_modules and shares the project root's
 */
function findBin(dir, binPath) {
  for (let d = dir; ; d = dirname(d)) {
    const candidate = join(d, binPath);
    if (existsSync(candidate)) return candidate;
    if (dirname(d) === d) return join(dir, binPath);
  }
}

/** Run a node_modules CLI without a shell (avoids npx and shell differences on Windows) */
export function runNodeBin(dir, binPath, args) {
  const r = spawnSync(process.execPath, [findBin(dir, binPath), ...args], { cwd: dir, encoding: "utf8" });
  return { status: r.status ?? 1, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

/** Exit with code 2. The stderr content is passed to Claude */
export function block(message) {
  process.stderr.write(message + "\n");
  process.exit(2);
}

/** Do not block, but make the user confirm whether to run it (PreToolUse only) */
export function ask(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: reason },
    })
  );
  process.exit(0);
}
