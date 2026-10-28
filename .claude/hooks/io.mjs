import { spawnSync } from "node:child_process";
import { join } from "node:path";

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

/** node_modules의 CLI를 셸 없이 실행한다 (Windows에서 npx·셸 차이를 피한다) */
export function runNodeBin(projectDir, binPath, args) {
  const r = spawnSync(process.execPath, [join(projectDir, binPath), ...args], { cwd: projectDir, encoding: "utf8" });
  return { status: r.status ?? 1, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

/** exit 2로 끝낸다. stderr 내용이 Claude에게 전달된다 */
export function block(message) {
  process.stderr.write(message + "\n");
  process.exit(2);
}
