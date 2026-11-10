// 훅 스크립트가 쓰는 순수 판단 함수. 입출력 없이 테스트할 수 있게 분리했다

const toPosix = (p) => p.replace(/\\/g, "/");

/** 수정된 파일이 lint 대상(src 아래 ts·tsx)이면 프로젝트 기준 상대 경로, 아니면 null */
export function lintTarget(filePath, projectDir) {
  if (!filePath) return null;
  const root = toPosix(projectDir).replace(/\/$/, "") + "/";
  const file = toPosix(filePath);
  // Windows 경로는 드라이브 문자 대소문자가 섞여 들어올 수 있다
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
      // 이름 바꾸기는 "옛 경로 -> 새 경로", 특수 문자가 든 경로는 따옴표로 감싸져 나온다
      const target = path.includes(" -> ") ? path.split(" -> ")[1] : path;
      return target.replace(/^"/, "").startsWith("src/");
    });
}

// 비밀 형식. 앞뒤 경계를 둬서 disk-usage 같은 일반 단어에 걸리지 않게 한다
const SECRET_PATTERNS = [
  ["AWS 액세스 키", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub 토큰", /\bgh[pousr]_[A-Za-z0-9]{36,}|\bgithub_pat_[A-Za-z0-9_]{22,}/],
  ["API 키(sk-)", /(?<![\w-])sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/],
  ["개인키(PEM)", /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/],
  ["Slack 토큰", /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
];

/** 글에 비밀로 보이는 값이 있으면 그 종류, 없으면 null */
export function findSecret(text) {
  return SECRET_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

/** .env 파일은 원래 비밀을 두는 곳이고 gitignore 대상이라 검사하지 않는다 */
export function isSecretExempt(filePath) {
  return /(?:^|[\\/])\.env[^\\/]*$/.test(filePath);
}

/** Write·Edit·MultiEdit 입력에서 새로 쓰는 글 */
export function writtenText(toolInput) {
  if (typeof toolInput.content === "string") return toolInput.content;
  if (typeof toolInput.new_string === "string") return toolInput.new_string;
  if (Array.isArray(toolInput.edits)) return toolInput.edits.map((e) => e.new_string ?? "").join("\n");
  return "";
}

const DANGEROUS_COMMANDS = [
  ["홈·루트 전체 삭제", /\brm\s+(?:-\S+\s+)+(?:\/\*?|~\/?|\$HOME\/?)(?=\s|$|[;&|])/],
  ["sudo", /(?:^|[;&|(]\s*)sudo\b/],
  ["디스크 직접 쓰기", /\bdd\s+if=|>\s*\/dev\/(?:sd|nvme|disk)/],
  ["디스크 포맷", /\bmkfs\b|\bFormat-Volume\b/i],
  ["내려받은 스크립트 바로 실행", /\b(?:curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^|]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh|iex|Invoke-Expression)\b/i],
];

/** 되돌릴 수 없는 위험한 명령이면 그 이유, 아니면 null */
export function dangerousCommand(command) {
  return DANGEROUS_COMMANDS.find(([, pattern]) => pattern.test(command))?.[0] ?? null;
}

/** 셸 명령에 gh pr create가 들어 있는지 */
export function isPrCreate(command) {
  return /\bgh\s+pr\s+create\b/.test(command);
}

/** gh pr create에 --head로 준 브랜치 (없으면 null) */
export function prHeadBranch(command) {
  return command.match(/--head(?:=|\s+)["']?([^\s"']+)/)?.[1] ?? null;
}

// 다른 작업에 딸려 오는 접두어 (기능과 함께 쓴 테스트·문서·서식). 작업 종류를 셀 때 빼고 센다
const SUPPORT_TYPES = new Set(["test", "docs", "style"]);

/**
 * 커밋 제목들에서 주 접두어(feat, fix, ci …)를 모은다.
 * 둘 이상이면 PR 하나에 서로 다른 작업이 섞였을 가능성이 크다 (작업 하나당 PR 하나 규칙).
 */
export function mainCommitTypes(subjects) {
  const types = new Set();
  for (const subject of subjects) {
    const type = subject.match(/^(\w+)(?:\([^)]*\))?!?:/)?.[1];
    if (type && !SUPPORT_TYPES.has(type)) types.add(type);
  }
  return [...types];
}

/** 커밋 명령에 Claude 공동 작성자 줄(Co-Authored-By: Claude …)을 직접 넣었는지 */
export function hasClaudeCoauthor(command) {
  return /co-authored-by:\s*claude|noreply@anthropic\.com/i.test(command);
}

/**
 * 명령이 아닌 글을 지운다: heredoc 본문(PR 본문 등), PowerShell here-string, 따옴표 안(커밋 메시지 등).
 * 글 속에 적힌 명령 이름을 실제 명령으로 오인하지 않게 한다
 */
const stripText = (command) =>
  command
    .replace(/<<-?\s*(["']?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2[ \t]*(?=\n|$)/g, "")
    .replace(/@(["'])\r?\n[\s\S]*?\r?\n\1@/g, "")
    // 줄 잇기(bash `\`, PowerShell 백틱 + 줄바꿈)는 한 명령이므로 공백으로 잇는다
    .replace(/[\\`]\r?\n/g, " ")
    // 따옴표로 감싼 옵션 하나("--output=x", "--output=a b")는 셸이 따옴표를 벗겨 옵션으로 넘기므로 옵션으로 남긴다.
    // `--이름` 또는 `--이름=값` 모양만 본다. "- 훅이 --amend를 막는다" 같은 글은 옵션이 아니다.
    // 알려진 오탐: 따옴표 안 전체가 옵션 모양 한 단어면(-m "--amend") 셸 수준에서 구별할 수 없어 옵션으로 본다
    .replace(/(^|\s)(["'])(--[A-Za-z][\w-]*(?:=[^"']*)?)\2(?=[\s;&|)]|$)/g, "$1$3")
    .replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, '""');

const GIT = String.raw`\bgit(?:\s+-c\s+\S+)*\s+`;
// 옵션은 같은 줄, 같은 명령(; & | 앞) 안에서만 찾는다
const SAME_COMMAND = String.raw`[^;&|\n]*`;
const HISTORY_REWRITES = [
  ["git commit --amend", new RegExp(GIT + String.raw`commit\b` + SAME_COMMAND + String.raw`\s--amend\b`)],
  // 이미 진행 중인 rebase를 멈추는 --abort·--quit은 기록을 바꾸지 않으므로 허용한다
  ["git rebase", new RegExp(GIT + String.raw`rebase\b(?!` + SAME_COMMAND + String.raw`\s--(?:abort|quit)\b)`)],
  ["git pull --rebase", new RegExp(GIT + "pull\\b" + SAME_COMMAND + String.raw`\s(?:--rebase\b(?!=false)|-r\b)`)],
];

/**
 * 이미 만든 커밋을 고치는 명령이면 그 종류, 아니면 null.
 * 커밋 규칙: 커밋은 고치지 않고, 고칠 게 생기면 새 커밋을 더한다.
 */
export function historyRewrite(command) {
  const bare = stripText(command);
  return HISTORY_REWRITES.find(([, pattern]) => pattern.test(bare))?.[0] ?? null;
}

const GIT_OUTPUT = new RegExp(GIT + String.raw`(diff|log|show)\b` + SAME_COMMAND + String.raw`\s--output(?=[=\s]|$)`);

/**
 * 권한 허용 목록의 조회 명령(git diff·log·show)에 --output이 붙어 파일을 쓰면 "git <명령> --output", 아니면 null.
 * 허용 목록 `git log *`는 뒤 인자를 가리지 않으므로, 이것으로 아무 파일이나 확인 없이 덮어쓸 수 있다
 */
export function gitOutputFile(command) {
  const match = stripText(command).match(GIT_OUTPUT);
  return match ? `git ${match[1]} --output` : null;
}
