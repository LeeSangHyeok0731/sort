# Claude Code 작업 하네스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이 저장소에 CLAUDE.md·구조 문서·ESLint 레이어 검사·권한·훅·프로젝트 스킬을 갖춘 Claude Code 작업 하네스를 만든다.

**Architecture:** 문서(CLAUDE.md, docs/ARCHITECTURE.md)로 규칙과 파일 구조를 고정하고, `eslint.config.mjs`의 `no-restricted-imports`로 FSD 의존 방향을 검사한다. `.claude/settings.json`에 권한과 훅을 두고, 훅은 node 스크립트(`.claude/hooks/*.mjs`)가 순수 판단 함수(`rules.mjs`)를 불러 쓰는 구조로 테스트 가능하게 한다.

**Tech Stack:** ESLint 9 flat config, Vitest, Node(ESM), Claude Code settings/hooks/skills

## Global Constraints

- 의존성은 추가하지 않는다.
- 문서·메시지·커밋은 한국어.
- 훅은 Windows(Git Bash·PowerShell)에서도 돌아야 한다 → node로 eslint·tsc의 bin을 직접 실행하고 셸에 의존하지 않는다.
- 레이어 순서: `app → views → widgets → features → entities → shared`. 슬라이스 밖에서는 index로만 import하고, 예외는 `@/entities/sort-algorithm/core` 하나.
- push·`gh pr create`·`gh pr merge`는 권한 허용 목록에 넣지 않는다.

---

### Task 1: ESLint 레이어 검사

**Files:**
- Modify: `eslint.config.mjs`
- Modify: `src/features/playback/index.ts` (`Track` export 추가)
- Modify: `src/widgets/visualizer/model/structures/scene.test.ts:4`

- [ ] **Step 1: 현재 위반 고치기**

`src/features/playback/index.ts`의 `export type { TrackStats } from "./model/track";`를 다음으로 바꾼다.
```ts
export { Track, type TrackStats } from "./model/track";
```
`scene.test.ts`의 두 import를 하나로 합친다.
```ts
import { Track, type TrackView } from "@/features/playback";
```

- [ ] **Step 2: 규칙 추가**

`eslint.config.mjs`를 다음으로 바꾼다.
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// FSD 레이어. 앞쪽 레이어만 뒤쪽 레이어를 import할 수 있다 (docs/ARCHITECTURE.md)
const LAYERS = ["app", "views", "widgets", "features", "entities", "shared"];

// 슬라이스 밖에서는 index로만 가져온다. core는 워커용 두 번째 진입점이라 허용한다
const DEEP_IMPORT = {
  group: ["@/entities/*/*", "@/features/*/*", "@/widgets/*/*", "@/views/*/*", "!@/entities/sort-algorithm/core"],
  message: "슬라이스 내부 파일은 직접 import할 수 없어요. 슬라이스의 index에서 export해 주세요. (docs/ARCHITECTURE.md)",
};

// 같은 파일에 no-restricted-imports를 두 번 걸면 뒤의 것이 덮어쓰므로 레이어마다 한 블록으로 만든다
const layerRules = LAYERS.map((layer, i) => {
  const upper = LAYERS.slice(0, i);
  const patterns = [DEEP_IMPORT];
  if (upper.length > 0) {
    patterns.push({
      group: upper.map((l) => `@/${l}`),
      message: `${layer} 레이어는 상위 레이어(${upper.join(", ")})를 import할 수 없어요. (docs/ARCHITECTURE.md)`,
    });
  }
  return {
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: { "no-restricted-imports": ["error", { patterns }] },
  };
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...layerRules,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 3: 통과 확인**

Run: `npm run lint`
Expected: 오류 0

- [ ] **Step 4: 위반을 잡는지 확인 (임시 파일, 커밋 안 함)**

`src/entities/array/_probe.ts`를 만든다.
```ts
import { useSortPlayer } from "@/features/playback";
import { Track } from "@/features/playback/model/track";
import { getAlgorithm } from "@/entities/sort-algorithm/core";
export { useSortPlayer, Track, getAlgorithm };
```
Run: `npx eslint src/entities/array/_probe.ts`
Expected: 1·2번째 줄 오류(상위 레이어, 내부 경로), 3번째 줄은 오류 없음. 확인 후 파일 삭제.

- [ ] **Step 5: 테스트·커밋**

Run: `npm test` → 전부 통과
```bash
git add eslint.config.mjs src/features/playback/index.ts src/widgets/visualizer/model/structures/scene.test.ts
git commit -m "chore: ESLint로 FSD 레이어 의존 방향과 공개 진입점 검사"
```

### Task 2: 훅 판단 로직

**Files:**
- Create: `.claude/hooks/rules.mjs`
- Test: `.claude/hooks/rules.test.mjs`
- Modify: `vitest.config.mts` (include 추가)

**Interfaces:**
- Produces:
  - `lintTarget(filePath: string, projectDir: string): string | null` — `src/` 아래 `.ts`/`.tsx`이면 프로젝트 기준 상대 경로(슬래시 구분), 아니면 null
  - `isGitCommit(command: string): boolean`
  - `hasSrcChanges(porcelain: string): boolean` — `git status --porcelain` 출력에 `src/` 경로가 있으면 true

- [ ] **Step 1: 실패하는 테스트**

```js
import { describe, expect, it } from "vitest";
import { hasSrcChanges, isGitCommit, lintTarget } from "./rules.mjs";

describe("lintTarget", () => {
  const root = "C:\\proj";
  it("src 아래 ts·tsx 파일은 상대 경로를 돌려준다", () => {
    expect(lintTarget("C:\\proj\\src\\a\\b.tsx", root)).toBe("src/a/b.tsx");
    expect(lintTarget("C:/proj/src/a.ts", root)).toBe("src/a.ts");
  });
  it("src 밖이거나 ts가 아니면 null", () => {
    expect(lintTarget("C:\\proj\\docs\\a.md", root)).toBeNull();
    expect(lintTarget("C:\\proj\\src\\app\\globals.css", root)).toBeNull();
    expect(lintTarget("C:\\other\\src\\a.ts", root)).toBeNull();
    expect(lintTarget("", root)).toBeNull();
  });
});

describe("isGitCommit", () => {
  it("git commit 명령을 찾는다", () => {
    expect(isGitCommit('git commit -m "x"')).toBe(true);
    expect(isGitCommit("git add . && git commit -q -m x")).toBe(true);
    expect(isGitCommit("git -c user.name=a commit -m x")).toBe(true);
  });
  it("commit이 아닌 git 명령은 통과", () => {
    expect(isGitCommit("git log --grep commit")).toBe(false);
    expect(isGitCommit("git status")).toBe(false);
    expect(isGitCommit("echo commit")).toBe(false);
  });
});

describe("hasSrcChanges", () => {
  it("src 경로 변경을 찾는다", () => {
    expect(hasSrcChanges(" M src/a.ts\n?? docs/x.md\n")).toBe(true);
    expect(hasSrcChanges("R  old.ts -> src/new.ts\n")).toBe(true);
  });
  it("src 밖 변경만 있으면 false", () => {
    expect(hasSrcChanges(" M docs/a.md\n?? .claude/x\n")).toBe(false);
    expect(hasSrcChanges("")).toBe(false);
  });
});
```
`vitest.config.mts`의 include를 `["src/**/*.test.ts", ".claude/hooks/**/*.test.mjs"]`로 바꾼다.

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run .claude/hooks`
Expected: FAIL (rules.mjs 없음)

- [ ] **Step 3: 구현**

```js
// 훅 스크립트가 쓰는 순수 판단 함수. 입출력 없이 테스트할 수 있게 분리했다

const toPosix = (p) => p.replace(/\\/g, "/");

/** 수정된 파일이 lint 대상(src 아래 ts·tsx)이면 프로젝트 기준 상대 경로, 아니면 null */
export function lintTarget(filePath, projectDir) {
  if (!filePath) return null;
  const root = toPosix(projectDir).replace(/\/$/, "") + "/";
  const file = toPosix(filePath);
  if (!file.toLowerCase().startsWith(root.toLowerCase())) return null;
  const rel = file.slice(root.length);
  return /^src\/.+\.tsx?$/.test(rel) ? rel : null;
}

/** 셸 명령에 git commit이 들어 있는지 (git -c k=v commit 형태 포함) */
export function isGitCommit(command) {
  return /\bgit(?:\s+-c\s+\S+)*\s+commit\b/.test(command);
}

/** git status --porcelain 출력에 src/ 아래 변경이 있는지 */
export function hasSrcChanges(porcelain) {
  return porcelain
    .split("\n")
    .filter(Boolean)
    .some((line) => {
      const path = line.slice(3);
      const target = path.includes(" -> ") ? path.split(" -> ")[1] : path;
      return target.replace(/^"/, "").startsWith("src/");
    });
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run .claude/hooks` → PASS, `npm run lint` → 오류 0

- [ ] **Step 5: 커밋**

```bash
git add .claude/hooks/rules.mjs .claude/hooks/rules.test.mjs vitest.config.mts
git commit -m "chore: Claude Code 훅 판단 로직과 테스트"
```

### Task 3: 훅 스크립트와 settings.json

**Files:**
- Create: `.claude/hooks/io.mjs`, `.claude/hooks/lint-file.mjs`, `.claude/hooks/guard-main-commit.mjs`, `.claude/hooks/typecheck-on-stop.mjs`
- Create: `.claude/settings.json`
- Modify: `.gitignore` (`.claude/settings.local.json`)

**Interfaces:**
- Consumes: Task 2의 `lintTarget`, `isGitCommit`, `hasSrcChanges`
- Produces: `readInput(): Promise<object>`, `runNodeBin(projectDir, binPath, args): { status: number, output: string }`, `block(message): never` (io.mjs)

- [ ] **Step 1: 공통 입출력**

`.claude/hooks/io.mjs`
```js
import { spawnSync } from "node:child_process";
import { join } from "node:path";

/** 훅 입력(stdin JSON)을 읽는다 */
export async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

/** node_modules의 CLI를 셸 없이 실행한다 (Windows에서 npx·셸 차이를 피한다) */
export function runNodeBin(projectDir, binPath, args) {
  const r = spawnSync(process.execPath, [join(projectDir, binPath), ...args], { cwd: projectDir, encoding: "utf8" });
  return { status: r.status ?? 1, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

/** exit 2: stderr 내용이 Claude에게 전달된다 */
export function block(message) {
  process.stderr.write(message + "\n");
  process.exit(2);
}
```

- [ ] **Step 2: 세 훅**

`.claude/hooks/lint-file.mjs`
```js
// PostToolUse(Edit|Write): 수정한 src 파일에 eslint를 돌려 오류를 바로 알려준다
import { block, readInput, runNodeBin } from "./io.mjs";
import { lintTarget } from "./rules.mjs";

const input = await readInput();
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const file = lintTarget(input.tool_input?.file_path ?? "", projectDir);
if (file) {
  const { status, output } = runNodeBin(projectDir, "node_modules/eslint/bin/eslint.js", [file]);
  if (status !== 0) block(`eslint 오류 (${file}):\n${output.trim()}`);
}
```

`.claude/hooks/guard-main-commit.mjs`
```js
// PreToolUse(Bash|PowerShell): main 브랜치에서 직접 커밋하지 않게 막는다
import { spawnSync } from "node:child_process";
import { block, readInput } from "./io.mjs";
import { isGitCommit } from "./rules.mjs";

const input = await readInput();
const command = input.tool_input?.command ?? "";
if (isGitCommit(command)) {
  const cwd = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
  const branch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd, encoding: "utf8" }).stdout?.trim();
  if (branch === "main") block("main 브랜치에는 직접 커밋하지 않아요. 기능 브랜치를 먼저 만드세요 (git switch -c <이름>).");
}
```

`.claude/hooks/typecheck-on-stop.mjs`
```js
// Stop: src에 변경이 있으면 타입 검사를 돌리고, 실패하면 Claude가 이어서 고치게 한다
import { spawnSync } from "node:child_process";
import { block, readInput, runNodeBin } from "./io.mjs";
import { hasSrcChanges } from "./rules.mjs";

const input = await readInput();
// 이미 Stop 훅 때문에 이어서 작업 중이면 다시 막지 않는다 (무한 반복 방지)
if (input.stop_hook_active) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const status = spawnSync("git", ["status", "--porcelain"], { cwd: projectDir, encoding: "utf8" }).stdout ?? "";
if (hasSrcChanges(status)) {
  const r = runNodeBin(projectDir, "node_modules/typescript/bin/tsc", ["--noEmit"]);
  if (r.status !== 0) block(`타입 검사 실패:\n${r.output.trim().split("\n").slice(0, 30).join("\n")}`);
}
```

- [ ] **Step 3: settings.json**

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run lint*)", "Bash(npm run typecheck*)", "Bash(npm test*)", "Bash(npm run build*)",
      "Bash(npx vitest*)", "Bash(npx tsc*)", "Bash(npx eslint*)",
      "Bash(git status*)", "Bash(git diff*)", "Bash(git log*)", "Bash(git branch*)", "Bash(git show*)",
      "Bash(gh pr view*)", "Bash(gh pr checks*)", "Bash(gh pr list*)",
      "PowerShell(npm run lint*)", "PowerShell(npm run typecheck*)", "PowerShell(npm test*)", "PowerShell(npm run build*)",
      "PowerShell(npx vitest*)", "PowerShell(npx tsc*)", "PowerShell(npx eslint*)",
      "PowerShell(git status*)", "PowerShell(git diff*)", "PowerShell(git log*)", "PowerShell(git branch*)", "PowerShell(git show*)",
      "PowerShell(gh pr view*)", "PowerShell(gh pr checks*)", "PowerShell(gh pr list*)"
    ],
    "deny": [
      "Bash(git push --force*)", "Bash(git push -f*)", "Bash(git push origin main*)", "Bash(git reset --hard*)",
      "PowerShell(git push --force*)", "PowerShell(git push -f*)", "PowerShell(git push origin main*)", "PowerShell(git reset --hard*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/lint-file.mjs\"" }] }
    ],
    "PreToolUse": [
      { "matcher": "Bash|PowerShell", "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/guard-main-commit.mjs\"" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/typecheck-on-stop.mjs\"", "timeout": 120 }] }
    ]
  }
}
```
`.gitignore` 끝에 추가:
```
# Claude Code 개인 설정
.claude/settings.local.json
```

- [ ] **Step 4: 샘플 입력으로 확인**

```bash
export CLAUDE_PROJECT_DIR=$PWD
echo '{"tool_input":{"file_path":"'$PWD'/docs/a.md"}}' | node .claude/hooks/lint-file.mjs; echo $?   # 0
echo '{"tool_input":{"file_path":"'$PWD'/src/app/page.tsx"}}' | node .claude/hooks/lint-file.mjs; echo $?   # 0
echo '{"tool_input":{"command":"git status"}}' | node .claude/hooks/guard-main-commit.mjs; echo $?   # 0
echo '{"tool_input":{"command":"git commit -m x"}}' | node .claude/hooks/guard-main-commit.mjs; echo $?   # 0 (기능 브랜치)
echo '{"stop_hook_active":true}' | node .claude/hooks/typecheck-on-stop.mjs; echo $?   # 0
```
lint 실패 경로: 임시로 `src/app/_probe.ts`에 `import { x } from "@/views/home/ui/HomeView"; export { x };`를 넣고 lint-file 훅 → exit 2와 메시지, 파일 삭제.
main 차단: 이 저장소를 `git worktree`로 main에 체크아웃하지 않고, `rules.test.mjs`(Task 2)와 브랜치 판별을 믿는다. 대신 `git stash`가 필요 없도록 브랜치 판별 줄만 `node -e`로 실행해 현재 브랜치명이 나오는지 확인한다.

- [ ] **Step 5: 커밋**

```bash
git add .claude/hooks/io.mjs .claude/hooks/lint-file.mjs .claude/hooks/guard-main-commit.mjs .claude/hooks/typecheck-on-stop.mjs .claude/settings.json .gitignore
git commit -m "chore: Claude Code 권한 설정과 훅(lint, main 커밋 차단, 타입 검사)"
```

### Task 4: 프로젝트 스킬

**Files:**
- Create: `.claude/skills/add-algorithm/SKILL.md`
- Create: `.claude/skills/ship/SKILL.md`

- [ ] **Step 1: add-algorithm** — frontmatter `name: add-algorithm`, `description:`(새 정렬 알고리즘을 추가할 때 사용). 본문은 spec 5절의 1~5단계를 그대로 옮기고, `bubbleSort.ts`/`bubbleSort.test.ts`를 예시로 가리키며 `defineCode`·`//@라벨`·`CODE.line()`·`describeSortAlgorithm` 사용법을 bubbleSort 코드 발췌로 보여준다. category 값과 families 폴더 목록을 적는다.

- [ ] **Step 2: ship** — frontmatter `name: ship`, `description:`(기능 브랜치를 검사→push→PR→CI→머지까지 반영할 때, 사용자 승인 후에만). 본문은 spec 5절의 1~7단계와 정확한 명령, PR 본문 템플릿(변경 내용 / 확인 + `🤖 Generated with [Claude Code](https://claude.com/claude-code)`), 실패 시 멈추고 보고하는 규칙.

- [ ] **Step 3: 커밋**

```bash
git add .claude/skills
git commit -m "chore: 프로젝트 스킬 add-algorithm, ship 추가"
```

### Task 5: 문서

**Files:**
- Create: `docs/ARCHITECTURE.md`
- Create: `CLAUDE.md`

- [ ] **Step 1: ARCHITECTURE.md** — spec 1절 항목(레이어 지도, `src/` 전체 파일 구조 트리와 슬라이스별 역할, 공개 진입점 규칙, 정렬 파이프라인과 파일 경로, 새 파일 위치 기준, 테스트 위치)을 실제 파일을 읽고 쓴다. ESLint 규칙(Task 1)이 이 문서를 근거로 한다고 적는다.

- [ ] **Step 2: CLAUDE.md** — spec 1절 항목. 마지막에 `@docs/ARCHITECTURE.md`. 하네스 구성(훅 3개·스킬 2개·권한) 요약 표를 넣는다.

- [ ] **Step 3: 커밋**

```bash
git add CLAUDE.md docs/ARCHITECTURE.md
git commit -m "docs: CLAUDE.md와 구조 문서 추가"
```

### Task 6: 최종 검증

- [ ] `npm run typecheck`, `npm test`, `npm run lint` 모두 통과
- [ ] `git status` 깨끗한지 확인
