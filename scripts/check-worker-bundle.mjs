// 정렬 워커 번들 검사 (npm run build 뒤에 npm run check:worker).
// new Worker(new URL(...))에 { type: "module" } 같은 옵션을 붙이면 Turbopack 프로덕션 빌드가 워커를 번들하지 않고
// .ts 원본을 정적 자산으로 복사할 수 있다. 개발 서버에서는 동작해 놓치기 쉬우므로 빌드 결과물을 직접 확인한다.
//
// Turbopack 빌드 결과물에서 워커는 이렇게 나온다.
//   메인 청크:  new Worker(e.r(57049))
//   모듈 정의:  57049,e=>{e.v(e.b(["static/chunks/<워커 청크>.js", ...]))}
//   워커 청크:  self.onmessage=e=>{... (0,s.executeSortJob)(e.data); self.postMessage({...},[o.ops.buffer]) ...}
// 워커가 .ts 원본을 가리키면 모듈 정의가 e.v("/_next/static/media/sort.worker.<해시>.ts")가 된다.
// (정상 빌드에서도 쓰이지 않는 .ts 자산과 그 모듈 정의가 함께 나오므로, .ts 파일이 있다는 것만으로는 실패로 보지 않는다)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

/** 정렬 워커 진입 청크에만 함께 들어 있는 표식 (sort.worker.ts가 sortJob.ts의 executeSortJob을 부르고 결과 버퍼를 넘긴다) */
export const WORKER_MARKERS = ["self.onmessage", "executeSortJob", "ops.buffer"];

const SOURCE_EXT = /\.(ts|tsx|mts|cts)$/;

/** "static/chunks/a.js", "/_next/static/chunks/a.js" → "chunks/a.js" (.next/static 기준 경로) */
export function toStaticPath(path) {
  return path.replace(/^\/?(_next\/)?static\//, "");
}

/** 정렬 워커 진입 청크인지 */
export function isSortWorkerChunk(content) {
  return WORKER_MARKERS.every((marker) => content.includes(marker));
}

/** `new Worker(` 바로 뒤의 첫 인자 식을 잘라 낸다 (괄호 짝과 문자열만 고려) */
export function firstArgument(content, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < content.length; i++) {
    const ch = content[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") {
      if (depth === 0) return content.slice(start, i);
      depth--;
    } else if (ch === "," && depth === 0) return content.slice(start, i);
  }
  return content.slice(start);
}

/**
 * Turbopack 모듈 정의 중 값을 내보내는 것(`ID,e=>{e.v(...)}`)을 찾는다.
 * 반환: Map<ID, { kind: "chunks", chunks: string[] } | { kind: "url", url: string }>
 */
export function findValueModules(content) {
  const modules = new Map();
  const re = /(?:^|[,[])\s*(\d+)\s*,\s*([\w$]+)\s*=>\s*\{\s*\2\.v\(/g;
  for (const match of content.matchAll(re)) {
    const [, id, param] = match;
    const rest = content.slice(match.index + match[0].length);
    const url = rest.match(/^\s*(["'])([^"']*)\1\s*\)/);
    if (url) {
      modules.set(id, { kind: "url", url: url[2] });
      continue;
    }
    const chunks = rest.match(new RegExp(`^\\s*${param.replace(/\$/g, "\\$")}\\.b\\(\\s*\\[([^\\]]*)\\]`));
    if (chunks) {
      const list = [...chunks[1].matchAll(/(["'])([^"']*)\1/g)].map((m) => toStaticPath(m[2]));
      modules.set(id, { kind: "chunks", chunks: list });
    }
  }
  return modules;
}

/**
 * 청크들에서 `new Worker(...)` 호출을 찾아 무엇을 띄우는지 정리한다.
 * target: { kind: "module", id } (Turbopack 모듈 참조) | { kind: "url", url } (문자열 경로) | null (알 수 없음, 예: Prism의 new Worker(r.filename))
 */
export function findWorkerCalls(files) {
  const calls = [];
  for (const { path, content } of files) {
    for (const match of content.matchAll(/new\s+Worker\s*\(/g)) {
      const arg = firstArgument(content, match.index + match[0].length);
      const moduleRef = arg.match(/^\s*[\w$]+\.r\(\s*(\d+)\s*\)\s*$/);
      const literal = arg.match(/(["'`])([^"'`]+)\1/);
      let target = null;
      if (moduleRef) target = { kind: "module", id: moduleRef[1] };
      else if (literal) target = { kind: "url", url: literal[2] };
      calls.push({ file: path, arg: arg.trim(), target });
    }
  }
  return calls;
}

/**
 * 빌드 결과물(.next/static 아래 파일들)을 검사한다.
 * files: { path: ".next/static 기준 경로(/ 구분)", content: string | null }[] (content는 JS 청크만 필요)
 * 반환: { errors: string[], workerChunks: string[], workerCalls: number }
 */
export function analyzeBuild(files) {
  const errors = [];
  const jsFiles = files.filter((f) => f.path.endsWith(".js") && typeof f.content === "string");
  const workerChunks = jsFiles.filter((f) => isSortWorkerChunk(f.content)).map((f) => f.path);

  const modules = new Map();
  for (const { content } of jsFiles) for (const [id, value] of findValueModules(content)) modules.set(id, value);

  // (b) 소스 파일(.ts)이 워커로 쓰이는지: 직접 경로로 띄우거나, 모듈 참조가 .ts 자산 URL이면 실패
  const calls = findWorkerCalls(jsFiles);
  let bundledCalls = 0;
  for (const call of calls) {
    const resolved = call.target?.kind === "module" ? modules.get(call.target.id) : call.target;
    if (!resolved) continue;
    if (resolved.kind === "url" && SOURCE_EXT.test(resolved.url.split(/[?#]/)[0])) {
      errors.push(`${call.file}: new Worker(${call.arg})가 번들되지 않은 소스 파일 ${resolved.url}을(를) 띄워요`);
    } else if (resolved.kind === "chunks" && resolved.chunks.some((c) => workerChunks.includes(c))) {
      bundledCalls++;
    }
  }

  // 워커로 쓰이지 않더라도 .ts 자산을 다른 모듈이 참조하면 실패 (정상 빌드에서는 정의만 있고 참조는 없다)
  const sourceAssets = files.filter((f) => SOURCE_EXT.test(f.path)).map((f) => f.path);
  for (const asset of sourceAssets) {
    for (const [id, value] of modules) {
      if (value.kind !== "url" || toStaticPath(value.url) !== asset) continue;
      const ref = new RegExp(`[\\w$]\\.[a-zA-Z]\\(\\s*${id}\\s*\\)`);
      const users = jsFiles.filter((f) => ref.test(f.content)).map((f) => f.path);
      for (const user of users) errors.push(`${user}: 정적 자산으로 복사된 소스 파일 ${asset}(모듈 ${id})을(를) 참조해요`);
    }
  }

  // (a) 정렬 워커가 JS 청크로 번들되고, 그 청크를 띄우는 new Worker 호출이 있는지
  if (workerChunks.length === 0) {
    errors.push(`정렬 워커 진입 청크를 찾지 못했어요 (표식: ${WORKER_MARKERS.join(", ")}). 워커가 JS로 번들되지 않았을 수 있어요`);
  } else if (bundledCalls === 0) {
    errors.push(`정렬 워커 청크(${workerChunks.join(", ")})는 있지만 그것을 띄우는 new Worker 호출을 찾지 못했어요`);
  }

  return { errors: [...new Set(errors)], workerChunks, workerCalls: bundledCalls };
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

function main(staticDir) {
  if (!existsSync(staticDir)) {
    console.error(`${staticDir}가 없어요. npm run build를 먼저 실행하세요`);
    return 1;
  }
  const files = [...walk(staticDir)].map((file) => {
    const path = relative(staticDir, file).split("\\").join("/");
    return { path, content: path.endsWith(".js") ? readFileSync(file, "utf8") : null };
  });
  const { errors, workerChunks, workerCalls } = analyzeBuild(files);
  if (errors.length === 0) {
    console.log(`워커 번들 검사 통과 (워커 청크: ${workerChunks.join(", ")}, new Worker 호출 ${workerCalls}곳)`);
    return 0;
  }
  console.error(
    `워커 번들 검사 실패 ${errors.length}건 — runInBackground.ts의 new Worker(new URL(...))에 옵션({ type: "module" } 등)을 붙이지 않았는지 확인하세요\n` +
      errors.map((e) => `  - ${e}`).join("\n"),
  );
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv[2] ?? ".next/static"));
}
