// 한 케이스(버전 × 알고리즘 × 크기)를 측정해 JSON 한 줄로 출력한다.
// 사용: node --expose-gc case.js <old|new> <bubble|quick|merge> <n> <seed>
import { bubbleSortSteps } from "./old/bubbleSort";
import { quickSortSteps } from "./old/quickSort";
import { mergeSortSteps } from "./old/mergeSort";
import { runSort } from "@/entities/sort-algorithm/model/run";
import { bubbleSort } from "@/entities/sort-algorithm/algorithms/bubbleSort";
import { quickSort } from "@/entities/sort-algorithm/algorithms/quickSort";
import { mergeSort } from "@/entities/sort-algorithm/algorithms/mergeSort";

const [version, algo, nArg, seedArg] = process.argv.slice(2);
const n = Number(nArg);

// 같은 seed면 두 버전이 똑같은 입력을 받는다 (mulberry32)
let s = Number(seedArg) >>> 0;
const rand = () => {
  s = (s + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const values = Array.from({ length: n }, (_, i) => i + 1);
for (let i = n - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [values[i], values[j]] = [values[j], values[i]];
}
const input = values.map((value, id) => ({ id, value }));

const OLD = { bubble: bubbleSortSteps, quick: quickSortSteps, merge: mergeSortSteps } as const;
const NEW = { bubble: bubbleSort, quick: quickSort, merge: mergeSort } as const;

const gc = (globalThis as { gc?: () => void }).gc!;
const mem = () => {
  const m = process.memoryUsage();
  return m.heapUsed + m.arrayBuffers;
};

gc();
const before = mem();
const t0 = performance.now();
let steps: number;
let keep: unknown;
if (version === "old") {
  const result = OLD[algo as keyof typeof OLD](input);
  steps = result.length;
  keep = result;
} else {
  const result = runSort(NEW[algo as keyof typeof NEW], input);
  steps = result.ops.length / 4;
  keep = result;
}
const ms = performance.now() - t0;
gc();
const bytes = mem() - before;
console.log(JSON.stringify({ version, algo, n, ms, bytes, steps, kept: keep !== null }));
