// Pure decision functions used by the hook scripts, kept separate so they can be tested without I/O

const toPosix = (p) => p.replace(/\\/g, "/");

/** If the edited file is a lint target (ts/tsx under src), its path relative to the project; otherwise null */
export function lintTarget(filePath, projectDir) {
  if (!filePath) return null;
  const root = toPosix(projectDir).replace(/\/$/, "") + "/";
  const file = toPosix(filePath);
  // Windows paths can arrive with the drive letter in either case
  if (!file.toLowerCase().startsWith(root.toLowerCase())) return null;
  const rel = file.slice(root.length);
  return /^src\/.+\.tsx?$/.test(rel) ? rel : null;
}

/** Whether a shell command contains git commit (including the git -c k=v commit form) */
export function isGitCommit(command) {
  return /\bgit(?:\s+-c\s+\S+)*\s+commit\b/.test(command);
}

/** Whether git status --porcelain output has changes under src/ */
export function hasSrcChanges(porcelain) {
  return porcelain
    .split("\n")
    .filter(Boolean)
    .some((line) => {
      const path = line.slice(3);
      // A rename shows as "old path -> new path"; paths with special characters come quoted
      const target = path.includes(" -> ") ? path.split(" -> ")[1] : path;
      return target.replace(/^"/, "").startsWith("src/");
    });
}

// Secret formats. Boundaries on both sides keep ordinary words like disk-usage from matching
const SECRET_PATTERNS = [
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}|\bgithub_pat_[A-Za-z0-9_]{22,}/],
  ["API key (sk-)", /(?<![\w-])sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/],
  ["private key (PEM)", /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
];

/** The kind of secret if the text contains something that looks like one; otherwise null */
export function findSecret(text) {
  return SECRET_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

/** .env files are where secrets belong and are gitignored, so they are not checked */
export function isSecretExempt(filePath) {
  return /(?:^|[\\/])\.env[^\\/]*$/.test(filePath);
}

/** The new text being written in a Write/Edit/MultiEdit input */
export function writtenText(toolInput) {
  if (typeof toolInput.content === "string") return toolInput.content;
  if (typeof toolInput.new_string === "string") return toolInput.new_string;
  if (Array.isArray(toolInput.edits)) return toolInput.edits.map((e) => e.new_string ?? "").join("\n");
  return "";
}

const DANGEROUS_COMMANDS = [
  ["deleting all of home or root", /\brm\s+(?:-\S+\s+)+(?:\/\*?|~\/?|\$HOME\/?)(?=\s|$|[;&|])/],
  ["sudo", /(?:^|[;&|(]\s*)sudo\b/],
  ["writing directly to a disk", /\bdd\s+if=|>\s*\/dev\/(?:sd|nvme|disk)/],
  ["formatting a disk", /\bmkfs\b|\bFormat-Volume\b/i],
  ["running a downloaded script directly", /\b(?:curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^|]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh|iex|Invoke-Expression)\b/i],
];

/** The reason if the command is irreversible and dangerous; otherwise null */
export function dangerousCommand(command) {
  return DANGEROUS_COMMANDS.find(([, pattern]) => pattern.test(command))?.[0] ?? null;
}

/** Whether a shell command contains gh pr create */
export function isPrCreate(command) {
  return /\bgh\s+pr\s+create\b/.test(command);
}

/** The branch given to gh pr create with --head (null if none) */
export function prHeadBranch(command) {
  return command.match(/--head(?:=|\s+)["']?([^\s"']+)/)?.[1] ?? null;
}

// Prefixes that accompany other work (tests, docs, formatting written with a feature). Left out when counting kinds of work
const SUPPORT_TYPES = new Set(["test", "docs", "style"]);

/**
 * Collect the main prefixes (feat, fix, ci …) from commit subjects.
 * Two or more means the PR likely mixes different kinds of work (one PR per task rule).
 */
export function mainCommitTypes(subjects) {
  const types = new Set();
  for (const subject of subjects) {
    const type = subject.match(/^(\w+)(?:\([^)]*\))?!?:/)?.[1];
    if (type && !SUPPORT_TYPES.has(type)) types.add(type);
  }
  return [...types];
}

/** Whether the commit command puts a Claude co-author line (Co-Authored-By: Claude …) in directly */
export function hasClaudeCoauthor(command) {
  return /co-authored-by:\s*claude|noreply@anthropic\.com/i.test(command);
}

/**
 * Remove text that is not command: heredoc bodies (PR bodies, etc.), PowerShell here-strings, quoted text (commit messages, etc.).
 * Keeps command names written inside text from being mistaken for real commands
 */
const stripText = (command) =>
  command
    .replace(/<<-?\s*(["']?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2[ \t]*(?=\n|$)/g, "")
    .replace(/@(["'])\r?\n[\s\S]*?\r?\n\1@/g, "")
    // A line continuation (bash `\`, PowerShell backtick + newline) is one command, so join it with a space
    .replace(/[\\`]\r?\n/g, " ")
    // A single quoted option ("--output=x", "--output=a b") is unquoted by the shell and passed as an option, so keep it as one.
    // Only the `--name` or `--name=value` shape counts. Text like "- 훅이 --amend를 막는다" is not an option.
    // Known false positive: if the whole quoted text is one option-shaped word (-m "--amend"), it cannot be told apart at the shell level and counts as an option
    .replace(/(^|\s)(["'])(--[A-Za-z][\w-]*(?:=[^"']*)?)\2(?=[\s;&|)]|$)/g, "$1$3")
    .replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, '""');

// Skip global options between git and the subcommand (-C path, -c key=value, --no-pager …) so a changed form like `git -C . push` cannot dodge the checks
const GIT = String.raw`\bgit(?:\s+(?:-[Cc]|--git-dir|--work-tree|--namespace)\s+\S+|\s+-[\w-]+(?:=\S+)?)*\s+`;
// Options are looked for only on the same line, within the same command (before ; & |)
const SAME_COMMAND = String.raw`[^;&|\n]*`;
// End of a word: whitespace, a command separator (; & | )), or end of line, so `--force;` with a separator attached is not missed
const END = String.raw`(?=[\s;&|)]|$)`;
const OPTION_END = String.raw`(?=[=\s;&|)]|$)`;
const HISTORY_REWRITES = [
  ["git commit --amend", new RegExp(GIT + String.raw`commit\b` + SAME_COMMAND + String.raw`\s--amend\b`)],
  // --abort and --quit stop a rebase already in progress without changing history, so they are allowed
  ["git rebase", new RegExp(GIT + String.raw`rebase\b(?!` + SAME_COMMAND + String.raw`\s--(?:abort|quit)\b)`)],
  ["git pull --rebase", new RegExp(GIT + "pull\\b" + SAME_COMMAND + String.raw`\s(?:--rebase\b(?!=false)|-r\b)`)],
];

/**
 * The kind if the command modifies existing commits; otherwise null.
 * Commit rule: never modify commits; add a new commit when something needs fixing.
 */
export function historyRewrite(command) {
  const bare = stripText(command);
  return HISTORY_REWRITES.find(([, pattern]) => pattern.test(bare))?.[0] ?? null;
}

const GIT_OUTPUT = new RegExp(GIT + String.raw`(diff|log|show)\b` + SAME_COMMAND + String.raw`\s--output(?=[=\s]|$)`);

/**
 * "git <command> --output" if an allowlisted read command (git diff/log/show) has --output and writes a file; otherwise null.
 * The allowlist rule `git log *` does not look at the arguments, so this could overwrite any file without confirmation
 */
export function gitOutputFile(command) {
  const match = stripText(command).match(GIT_OUTPUT);
  return match ? `git ${match[1]} --output` : null;
}

// Check commands on the allowlist (`npx eslint *`, `npm test *` …). Arguments after `--` in npm run are passed to the tool
const ESLINT = String.raw`\b(?:npx\s+eslint|npm\s+run\s+lint)(?=\s|$)`;
const VITEST = String.raw`\b(?:npx\s+vitest|npm\s+(?:run\s+)?test)(?=\s|$)`;
const TSC = String.raw`\b(?:npx\s+tsc|npm\s+run\s+typecheck)(?=\s|$)`;
const TOOL_WRITES = [
  ["eslint --fix", ESLINT, "--fix"],
  ["eslint --output-file", ESLINT, "(?:-o|--output-file)"],
  ["vitest --update", VITEST, "(?:-u|--update)"],
  // Per-reporter forms such as `--outputFile.json=x` also exist
  ["vitest --outputFile", VITEST, String.raw`--outputFile(?:\.\w+)?`],
  // Options that turn off noEmit, or that write build info, tsconfig or trace files even with noEmit
  [
    "tsc file output",
    TSC,
    String.raw`(?:--noEmit(?:=|\s+)false|--outDir|--outFile|--declarationDir|--tsBuildInfoFile|--build|-b|--init|--generateTrace)`,
  ],
].map(([label, tool, option]) => [label, new RegExp(tool + SAME_COMMAND + String.raw`\s` + option + OPTION_END)]);
// With file arguments or another -p, npx tsc does not apply the tsconfig's noEmit and writes .js. Calls without an explicit --noEmit are asked about
TOOL_WRITES.push([
  "tsc file output",
  new RegExp(String.raw`\bnpx\s+tsc(?=\s|$)(?!` + SAME_COMMAND + String.raw`\s--noEmit` + END + ")"),
]);

/**
 * The kind if an allowlisted check command (eslint/vitest/tsc) has an option that writes files; otherwise null.
 * The allowlist does not look at the arguments, so this could change sources or write any file without confirmation
 */
export function toolWriteOption(command) {
  const bare = stripText(command);
  return TOOL_WRITES.find(([, pattern]) => pattern.test(bare))?.[0] ?? null;
}

// The same commands as the settings.json deny rules. Permission rules stop matching when the form changes (`git -C . push --force`), so the hook checks again
const PUSH = GIT + String.raw`push\b` + SAME_COMMAND;
const FORBIDDEN_GIT = [
  // --mirror overwrites and even deletes remote refs
  [
    "force push",
    new RegExp(PUSH + String.raw`\s(?:(?:--force(?:-with-lease|-if-includes)?|--mirror)` + OPTION_END + String.raw`|-[a-z]*f[a-z]*` + END + String.raw`|\+\S)`),
  ],
  // --all pushes the local main too
  ["direct push to main", new RegExp(PUSH + String.raw`(?:[\s:](?:refs/heads/)?main|\s--all)` + END)],
  ["git reset --hard", new RegExp(GIT + String.raw`reset\b` + SAME_COMMAND + String.raw`\s--hard\b`)],
];

/** The kind if it is a git command settings.json denies (force push/--mirror, direct push to main/--all, reset --hard); otherwise null */
export function forbiddenGit(command) {
  // A single quoted word (`"main"`) is unquoted by the shell, so look at it unquoted
  const bare = stripText(command.replace(/(^|\s)(["'])([\w./:+-]+)\2(?=[\s;&|)]|$)/g, "$1$3"));
  return FORBIDDEN_GIT.find(([, pattern]) => pattern.test(bare))?.[0] ?? null;
}
