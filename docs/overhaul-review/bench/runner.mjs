// 케이스마다 새 node 프로세스를 띄워 측정한다 (메모리 부족으로 죽어도 다음 케이스는 계속).
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const caseJs = fileURLToPath(new URL("./case.js", import.meta.url));
const HEAP_MB = 4096;
const SIZES = [100, 300, 500, 1000];
const ALGOS = ["bubble", "quick", "merge"];
const SEEDS = [1, 2, 3];

const rows = [];
for (const algo of ALGOS) {
  for (const n of SIZES) {
    for (const version of ["old", "new"]) {
      const runs = [];
      let failure = null;
      for (const seed of SEEDS) {
        const t0 = Date.now();
        const r = spawnSync(
          process.execPath,
          ["--expose-gc", `--max-old-space-size=${HEAP_MB}`, caseJs, version, algo, String(n), String(seed)],
          { encoding: "utf8", timeout: 300_000 }
        );
        if (r.status !== 0) {
          const oom = /heap out of memory|Allocation failed/i.test(r.stderr);
          failure = { reason: oom ? "OOM" : `exit ${r.status ?? r.signal}`, afterMs: Date.now() - t0 };
          break;
        }
        runs.push(JSON.parse(r.stdout.trim().split("\n").pop()));
      }
      const median = (k) => runs.map((x) => x[k]).sort((a, b) => a - b)[Math.floor(runs.length / 2)];
      const row = failure
        ? { algo, n, version, failure }
        : { algo, n, version, ms: median("ms"), bytes: median("bytes"), steps: median("steps") };
      rows.push(row);
      console.log(JSON.stringify(row));
    }
  }
}
writeFileSync(fileURLToPath(new URL("./results.json", import.meta.url)), JSON.stringify(rows, null, 2));
