import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** 훅 입력(stdin JSON)을 읽는다 */
export async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

/** 훅이 기준으로 삼을 프로젝트 루트 */
export function projectDirOf(input) {
  return process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
}

/**
 * 명령이 실제로 도는 폴더. worktree에서 일하는 서브에이전트는 프로젝트 루트가 아니라
 * 자기 worktree에서 명령을 돌리므로, 브랜치를 볼 때는 이 폴더를 기준으로 한다
 */
export function commandDirOf(input) {
  return input.cwd ?? projectDirOf(input);
}

/** dir이 속한 git 작업 트리(worktree 포함)의 루트. git 밖이면 null */
export function repoRootOf(dir) {
  if (!dir || !existsSync(dir)) return null;
  const r = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd: dir, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

/** git 명령을 dir에서 돌려 표준 출력을 돌려준다. 실패하면 null */
export function git(dir, args) {
  const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  return r.status === 0 ? r.stdout : null;
}

/**
 * dir에서 위로 올라가며 binPath(node_modules/...)를 찾는다.
 * worktree에는 node_modules가 없고, 프로젝트 루트의 것을 같이 쓴다
 */
function findBin(dir, binPath) {
  for (let d = dir; ; d = dirname(d)) {
    const candidate = join(d, binPath);
    if (existsSync(candidate)) return candidate;
    if (dirname(d) === d) return join(dir, binPath);
  }
}

/** node_modules의 CLI를 셸 없이 실행한다 (Windows에서 npx·셸 차이를 피한다) */
export function runNodeBin(dir, binPath, args) {
  const r = spawnSync(process.execPath, [findBin(dir, binPath), ...args], { cwd: dir, encoding: "utf8" });
  return { status: r.status ?? 1, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

/** exit 2로 끝낸다. stderr 내용이 Claude에게 전달된다 */
export function block(message) {
  process.stderr.write(message + "\n");
  process.exit(2);
}

/** 막지는 않고 사용자에게 실행할지 묻게 한다 (PreToolUse 전용) */
export function ask(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: reason },
    })
  );
  process.exit(0);
}
