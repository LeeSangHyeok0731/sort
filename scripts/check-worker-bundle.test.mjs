import { describe, expect, it } from "vitest";
import {
  analyzeBuild,
  findValueModules,
  findWorkerCalls,
  firstArgument,
  isSortWorkerChunk,
  toStaticPath,
} from "./check-worker-bundle.mjs";

// 실제 Turbopack 프로덕션 빌드 결과물에서 줄여 온 모양
const WORKER_CHUNK =
  '(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,26713,e=>{"use strict";var s=e.i(42177);self.onmessage=e=>{try{let o=(0,s.executeSortJob)(e.data);self.postMessage({ok:!0,result:o},[o.ops.buffer])}catch(e){self.postMessage({ok:!1,error:String(e)})}},e.s([])}]);';
const TS_ASSET_MODULE = '77745,e=>{e.v("/_next/static/media/sort.worker.5b744491.ts")}';
const WORKER_MODULE = '57049,e=>{e.v(e.b(["static/chunks/worker.js","static/chunks/algos.js","static/chunks/turbopack-x.js"]))}';
const PRISM = "if(n&&e.Worker){var c=new Worker(r.filename);c.onmessage=function(e){h(e.data)}}";

const mainChunk = (workerCall) =>
  `(globalThis.TURBOPACK||[]).push([0,${TS_ASSET_MODULE},${WORKER_MODULE},63728,e=>{${PRISM};function sz(){return ${workerCall}}}]);`;

const build = (main, { worker = true, tsAsset = true } = {}) => [
  { path: "chunks/main.js", content: main },
  ...(worker ? [{ path: "chunks/worker.js", content: WORKER_CHUNK }] : []),
  { path: "chunks/algos.js", content: "executeSortJob" },
  ...(tsAsset ? [{ path: "media/sort.worker.5b744491.ts", content: null }] : []),
  { path: "media/favicon.ico", content: null },
];

describe("toStaticPath", () => {
  it("청크 목록과 URL 경로를 .next/static 기준으로 맞춘다", () => {
    expect(toStaticPath("static/chunks/a.js")).toBe("chunks/a.js");
    expect(toStaticPath("/_next/static/media/a.ts")).toBe("media/a.ts");
    expect(toStaticPath("chunks/a.js")).toBe("chunks/a.js");
  });
});

describe("isSortWorkerChunk", () => {
  it("워커 진입 청크만 표식을 모두 가진다", () => {
    expect(isSortWorkerChunk(WORKER_CHUNK)).toBe(true);
    // 메인 스레드 대체 경로도 executeSortJob을 쓰고, Prism은 onmessage를 쓴다
    expect(isSortWorkerChunk("(0,s.executeSortJob)(job)")).toBe(false);
    expect(isSortWorkerChunk(PRISM)).toBe(false);
  });
});

describe("firstArgument", () => {
  it("괄호 짝과 문자열 안의 쉼표·괄호를 건너뛰고 첫 인자만 자른다", () => {
    const src = 'new Worker(e.r(57049),{type:"module"})';
    expect(firstArgument(src, "new Worker(".length)).toBe("e.r(57049)");
    const src2 = 'new Worker(new URL("./a,b).ts",import.meta.url))';
    expect(firstArgument(src2, "new Worker(".length)).toBe('new URL("./a,b).ts",import.meta.url)');
  });
});

describe("findValueModules", () => {
  it("청크 목록을 내보내는 모듈과 URL을 내보내는 모듈을 구분한다", () => {
    const modules = findValueModules(mainChunk("new Worker(e.r(57049))"));
    expect(modules.get("57049")).toEqual({
      kind: "chunks",
      chunks: ["chunks/worker.js", "chunks/algos.js", "chunks/turbopack-x.js"],
    });
    expect(modules.get("77745")).toEqual({ kind: "url", url: "/_next/static/media/sort.worker.5b744491.ts" });
    expect(modules.has("63728")).toBe(false);
  });
});

describe("findWorkerCalls", () => {
  it("모듈 참조, 문자열 경로, 알 수 없는 인자를 나눈다", () => {
    const calls = findWorkerCalls([
      { path: "a.js", content: `${PRISM};new Worker(e.r(57049),{type:"module",type:void 0});new Worker("/x.ts")` },
    ]);
    expect(calls.map((c) => c.target)).toEqual([
      null,
      { kind: "module", id: "57049" },
      { kind: "url", url: "/x.ts" },
    ]);
  });
});

describe("analyzeBuild", () => {
  it("워커가 JS 청크로 번들된 정상 빌드는 통과한다 (쓰이지 않는 .ts 자산은 무시)", () => {
    const result = analyzeBuild(build(mainChunk("new Worker(e.r(57049))")));
    expect(result.errors).toEqual([]);
    expect(result.workerChunks).toEqual(["chunks/worker.js"]);
    expect(result.workerCalls).toBe(1);
  });

  it("Turbopack이 옵션을 덮어써도 번들된 청크를 띄우면 통과한다", () => {
    const result = analyzeBuild(build(mainChunk('new Worker(e.r(57049),{type:"module",type:void 0})')));
    expect(result.errors).toEqual([]);
  });

  it("워커가 .ts 자산 모듈을 가리키면 실패한다", () => {
    const { errors } = analyzeBuild(build(mainChunk("new Worker(e.r(77745))"), { worker: false }));
    expect(errors.some((e) => e.includes("번들되지 않은 소스 파일"))).toBe(true);
    expect(errors.some((e) => e.includes("정적 자산으로 복사된 소스 파일"))).toBe(true);
    expect(errors.some((e) => e.includes("진입 청크를 찾지 못했어요"))).toBe(true);
  });

  it("new URL로 .ts 경로를 그대로 띄우면 실패한다", () => {
    const { errors } = analyzeBuild(
      build(mainChunk('new Worker(new URL("/_next/static/media/sort.worker.5b744491.ts",location.href))')),
    );
    expect(errors.some((e) => e.includes("번들되지 않은 소스 파일"))).toBe(true);
  });

  it("다른 모듈이 .ts 자산을 참조하면 실패한다", () => {
    const main = mainChunk("new Worker(e.r(57049))") + "let u=e.r(77745);";
    const { errors } = analyzeBuild(build(main));
    expect(errors).toEqual([expect.stringContaining("정적 자산으로 복사된 소스 파일 media/sort.worker.5b744491.ts")]);
  });

  it("워커 청크가 없으면 실패한다", () => {
    const { errors } = analyzeBuild(build(mainChunk("new Worker(e.r(57049))"), { worker: false }));
    expect(errors).toEqual([expect.stringContaining("진입 청크를 찾지 못했어요")]);
  });

  it("워커 청크는 있는데 그것을 띄우는 호출이 없으면 실패한다", () => {
    const { errors } = analyzeBuild(build(mainChunk("null")));
    expect(errors).toEqual([expect.stringContaining("new Worker 호출을 찾지 못했어요")]);
  });
});
