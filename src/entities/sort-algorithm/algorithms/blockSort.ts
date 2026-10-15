import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`// 블록 정렬 (WikiSort, Mike McFadden) — 보조 메모리 없이 O(n log n) 안정 병합 정렬
// 구간은 { start, end } (end는 포함하지 않음)
function blockSort(arr) {
  const n = arr.length;
  if (n < 4) return insertionSort(arr, range(0, n));
  // 크기를 2의 거듭제곱 비율로 나눠 4~8개짜리 구간들을 삽입 정렬
  const it = new Iterator(n, 4);
  while (!it.finished()) insertionSort(arr, it.nextRange());
  if (n < 8) return arr;

  // 구간 크기를 2배씩 키우며 이웃한 A, B 구간을 병합
  for (;;) {
    let blockSize = Math.floor(Math.sqrt(it.length()));
    let bufferSize = Math.floor(it.length() / blockSize) + 1;
    // 1) 내부 버퍼 두 개를 만들 고유 값을 찾는다
    //    buffer1: A 블록마다 꼬리표(태그)로 붙일 값, buffer2: 병합할 때 빈자리로 쓸 값
    let buffer1 = range(0, 0), buffer2 = range(0, 0);
    const pull = [{ from: 0, to: 0, count: 0, range: range(0, 0) }, { from: 0, to: 0, count: 0, range: range(0, 0) }];
    let pullIndex = 0;
    let find = bufferSize * 2, findSeparately = false;
    if (find > it.length()) {
      find = bufferSize; // 한 구간에 둘 다 담을 수 없으면 따로 찾는다
      findSeparately = true;
    }
    it.begin();
    while (!it.finished()) {
      const A = it.nextRange(), B = it.nextRange();
      // A 앞쪽에서 서로 다른 값을 센다
      let last = A.start, count = 1, index;
      for (; count < find; last = index, count++) {
        index = findLastForward(arr, last, range(last + 1, A.end), find - count);
        if (index === A.end) break;
      }
      index = last;
      if (count >= bufferSize) {
        pull[pullIndex] = { range: range(A.start, B.end), count, from: index, to: A.start };
        pullIndex = 1;
        if (count === bufferSize * 2) {
          buffer1 = range(A.start, A.start + bufferSize);
          buffer2 = range(A.start + bufferSize, A.start + count);
          break;
        } else if (find === bufferSize * 2) {
          buffer1 = range(A.start, A.start + count);
          find = bufferSize;
        } else if (findSeparately) {
          buffer1 = range(A.start, A.start + count);
          findSeparately = false;
        } else {
          buffer2 = range(A.start, A.start + count);
          break;
        }
      } else if (pullIndex === 0 && count > len(buffer1)) {
        buffer1 = range(A.start, A.start + count);
        pull[pullIndex] = { range: range(A.start, B.end), count, from: index, to: A.start };
      }
      // B 뒤쪽에서 서로 다른 값을 센다
      for (last = B.end - 1, count = 1; count < find; last = index - 1, count++) {
        index = findFirstBackward(arr, last, range(B.start, last), find - count);
        if (index === B.start) break;
      }
      index = last;
      if (count >= bufferSize) {
        pull[pullIndex] = { range: range(A.start, B.end), count, from: index, to: B.end };
        pullIndex = 1;
        if (count === bufferSize * 2) {
          buffer1 = range(B.end - count, B.end - bufferSize);
          buffer2 = range(B.end - bufferSize, B.end);
          break;
        } else if (find === bufferSize * 2) {
          buffer1 = range(B.end - count, B.end);
          find = bufferSize;
        } else if (findSeparately) {
          buffer1 = range(B.end - count, B.end);
          findSeparately = false;
        } else {
          // buffer1을 같은 A에서 뺐다면 그 A의 재배치가 buffer2 앞에서 멈추게 한다
          if (pull[0].range.start === A.start) pull[0].range.end -= pull[1].count;
          buffer2 = range(B.end - count, B.end);
          break;
        }
      } else if (pullIndex === 0 && count > len(buffer1)) {
        buffer1 = range(B.end - count, B.end);
        pull[pullIndex] = { range: range(A.start, B.end), count, from: index, to: B.end };
      }
    }

    // 2) 찾은 고유 값들을 구간 끝(A는 맨 앞, B는 맨 뒤)으로 회전시켜 뽑아낸다
    for (const p of pull) {
      const length = p.count;
      if (p.to < p.from) {
        let index = p.from;
        for (let count = 1; count < length; count++) {
          index = findFirstBackward(arr, index - 1, range(p.to, p.from - (count - 1)), length - count);
          const r = range(index + 1, p.from + 1);
          rotate(arr, len(r) - count, r);
          p.from = index + count;
        }
      } else if (p.to > p.from) {
        let index = p.from + 1;
        for (let count = 1; count < length; count++) {
          index = findLastForward(arr, index, range(index, p.to), length - count);
          rotate(arr, count, range(p.from, index - 1));
          p.from = index - 1 - count;
        }
      }
    }
    bufferSize = len(buffer1);
    blockSize = Math.floor(it.length() / bufferSize) + 1;

    // 3) 각 A, B 쌍을 병합
    it.begin();
    while (!it.finished()) {
      const A = it.nextRange(), B = it.nextRange();
      // 내부 버퍼로 쓰는 부분은 빼고 병합한다
      const start = A.start;
      let skip = false;
      for (const p of pull) {
        if (start !== p.range.start || skip) continue;
        if (p.from > p.to) A.start += p.count;
        else if (p.from < p.to) B.end -= p.count;
        if (len(A) === 0 || len(B) === 0) skip = true;
      }
      if (skip) continue;

      if (arr[B.end - 1] < arr[A.start]) { //@cmp-reversed
        rotate(arr, len(A), range(A.start, B.end)); // B 전체가 A 전체보다 작다
      } else if (arr[A.end] < arr[A.end - 1]) { //@cmp-ordered
        // A를 blockSize 블록으로 나눈다 (맨 앞 firstA만 길이가 다름)
        const blockA = range(A.start, A.end);
        const firstA = range(A.start, A.start + (len(blockA) % blockSize));
        // 각 A 블록의 첫 값을 buffer1 값(태그)과 맞바꾼다 → 블록이 섞여도 원래 순서를 안다
        for (let indexA = buffer1.start, i = firstA.end; i < blockA.end; indexA++, i += blockSize) {
          swap(arr, indexA, i); //@swap-tag
        }
        let lastA = firstA, lastB = range(0, 0);
        const blockB = range(B.start, B.start + Math.min(blockSize, len(B)));
        blockA.start += len(firstA);
        let indexA = buffer1.start;
        // 병합할 A 블록은 미리 buffer2와 맞바꿔 둔다 (buffer2가 빈자리가 됨)
        if (len(buffer2) > 0) swapBlocks(arr, lastA.start, buffer2.start, len(lastA));

        // A 블록들을 B 블록 사이로 굴리며, 내려놓을 때마다 앞 A 블록과 그 뒤 B 값들을 병합
        while (len(blockA) > 0) {
          if ((len(lastB) > 0 && !(arr[lastB.end - 1] < arr[indexA])) || len(blockB) === 0) { //@cmp-drop
            // 가장 작은 A 블록을 내려놓는다: 앞 B 블록을 그 첫 값 위치에서 나눈다
            const bSplit = binaryFirst(arr, indexA, lastB);
            const bRemaining = lastB.end - bSplit;
            // 남은 A 블록 중 태그가 가장 작은(= 원래 가장 앞) 블록을 맨 앞으로
            let minA = blockA.start;
            for (let findA = minA + blockSize; findA < blockA.end; findA += blockSize) {
              if (arr[findA] < arr[minA]) minA = findA; //@cmp-min-a
            }
            swapBlocks(arr, blockA.start, minA, blockSize);
            // 태그를 떼고 원래 첫 값을 돌려놓는다
            swap(arr, blockA.start, indexA++); //@swap-untag
            // 앞 A 블록과 그 뒤 B 값들을 병합 (buffer2가 있으면 빈자리로, 없으면 회전으로)
            if (len(buffer2) > 0) mergeInternal(arr, lastA, range(lastA.end, bSplit), buffer2);
            else mergeInPlace(arr, lastA, range(lastA.end, bSplit));
            if (len(buffer2) > 0) {
              // 이번 A 블록을 buffer2에 넣어 두고, 남은 B 값은 블록 맞바꾸기로 옮긴다
              swapBlocks(arr, blockA.start, buffer2.start, blockSize);
              swapBlocks(arr, bSplit, blockA.start + blockSize - bRemaining, bRemaining);
            } else {
              rotate(arr, blockA.start - bSplit, range(bSplit, blockA.start + blockSize));
            }
            lastA = range(blockA.start - bRemaining, blockA.start - bRemaining + blockSize);
            lastB = range(lastA.end, lastA.end + bRemaining);
            blockA.start += blockSize;
          } else if (len(blockB) < blockSize) {
            // 마지막 짧은 B 블록은 남은 A 블록들 앞으로 회전
            rotate(arr, blockB.start - blockA.start, range(blockA.start, blockB.end));
            lastB = range(blockA.start, blockA.start + len(blockB));
            blockA.start += len(blockB);
            blockA.end += len(blockB);
            blockB.end = blockB.start;
          } else {
            // 맨 앞 A 블록과 다음 B 블록을 맞바꿔 A 블록들을 한 칸 굴린다
            swapBlocks(arr, blockA.start, blockB.start, blockSize);
            lastB = range(blockA.start, blockA.start + blockSize);
            blockA.start += blockSize;
            blockA.end += blockSize;
            blockB.start += blockSize;
            blockB.end = blockB.end > B.end - blockSize ? B.end : blockB.end + blockSize;
          }
        }
        // 마지막 A 블록과 남은 B 값들을 병합
        if (len(buffer2) > 0) mergeInternal(arr, lastA, range(lastA.end, B.end), buffer2);
        else mergeInPlace(arr, lastA, range(lastA.end, B.end));
      }
    }

    // 4) 섞인 buffer2를 정렬하고, 두 버퍼의 값을 원래 자리로 되돌린다 (뽑아낼 때의 반대)
    insertionSort(arr, buffer2);
    for (const p of pull) {
      let unique = p.count * 2;
      if (p.from > p.to) {
        const buffer = range(p.range.start, p.range.start + p.count);
        while (len(buffer) > 0) {
          const index = findFirstForward(arr, buffer.start, range(buffer.end, p.range.end), unique);
          const amount = index - buffer.end;
          rotate(arr, len(buffer), range(buffer.start, index));
          buffer.start += amount + 1;
          buffer.end += amount;
          unique -= 2;
        }
      } else if (p.from < p.to) {
        const buffer = range(p.range.end - p.count, p.range.end);
        while (len(buffer) > 0) {
          const index = findLastBackward(arr, buffer.end - 1, range(p.range.start, buffer.start), unique);
          const amount = buffer.start - index;
          rotate(arr, amount, range(index, buffer.end));
          buffer.start -= amount;
          buffer.end -= amount + 1;
          unique -= 2;
        }
      }
    }
    if (!it.nextLevel()) break;
  }
  return arr;
}

// A의 값은 buffer에 들어 있고 A 자리는 빈자리: 결과를 A 자리부터 채우며 버퍼 값과 맞바꾼다
function mergeInternal(arr, A, B, buffer) {
  let aCount = 0, bCount = 0, insert = 0;
  if (len(B) > 0 && len(A) > 0) {
    for (;;) {
      const fromA = !(arr[B.start + bCount] < arr[buffer.start + aCount]); //@cmp-merge
      swap(arr, A.start + insert++, fromA ? buffer.start + aCount++ : B.start + bCount++); //@swap-merge
      if (aCount >= len(A) || bCount >= len(B)) break;
    }
  }
  swapBlocks(arr, buffer.start + aCount, A.start + insert, len(A) - aCount);
}

// 버퍼 없이: A의 첫 값이 들어갈 B 위치까지 A를 회전으로 옮기기를 반복
function mergeInPlace(arr, A, B) {
  while (len(A) > 0 && len(B) > 0) {
    const mid = binaryFirst(arr, A.start, B);
    const amount = mid - A.end;
    rotate(arr, len(A), range(A.start, mid));
    if (B.end === mid) break;
    B.start = mid;
    A = range(A.start + amount, B.start);
    A.start = binaryLast(arr, A.start, A);
  }
}

// 크기를 2의 거듭제곱 개수로 나누는 구간 반복자 (나머지는 분수처럼 고르게 배분)
class Iterator {
  constructor(size, minLevel) {
    this.size = size;
    let pow = 1;
    while (pow * 2 <= size) pow *= 2;
    this.denominator = pow / minLevel;
    this.decimalStep = Math.floor(size / this.denominator);
    this.numeratorStep = size % this.denominator;
    this.begin();
  }
  begin() { this.numerator = this.decimal = 0; }
  nextRange() {
    const start = this.decimal;
    this.decimal += this.decimalStep;
    this.numerator += this.numeratorStep;
    if (this.numerator >= this.denominator) { this.numerator -= this.denominator; this.decimal++; }
    return range(start, this.decimal);
  }
  finished() { return this.decimal >= this.size; }
  nextLevel() {
    this.decimalStep += this.decimalStep;
    this.numeratorStep += this.numeratorStep;
    if (this.numeratorStep >= this.denominator) { this.numeratorStep -= this.denominator; this.decimalStep++; }
    return this.decimalStep < this.size;
  }
  length() { return this.decimalStep; }
}

// 값 arr[key]가 들어갈 첫 위치 (같은 값 앞) / 마지막 위치 (같은 값 뒤) — 이진 탐색
function binaryFirst(arr, key, r) {
  let lo = r.start, hi = r.end;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < arr[key]) lo = mid + 1; //@cmp-lower
    else hi = mid;
  }
  return lo;
}
function binaryLast(arr, key, r) {
  let lo = r.start, hi = r.end;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (!(arr[key] < arr[mid])) lo = mid + 1; //@cmp-upper
    else hi = mid;
  }
  return lo;
}

// 고유 값이 unique개쯤 있다고 보고 len/unique 간격으로 건너뛰며 찾은 뒤 그 칸 안에서 이진 탐색
function findFirstForward(arr, key, r, unique) {
  if (len(r) === 0) return r.start;
  const skip = Math.max(Math.floor(len(r) / unique), 1);
  let index = r.start + skip;
  for (; arr[index - 1] < arr[key]; index += skip) { //@cmp-find-first-fwd
    if (index >= r.end - skip) return binaryFirst(arr, key, range(index, r.end));
  }
  return binaryFirst(arr, key, range(index - skip, index));
}
function findLastForward(arr, key, r, unique) {
  if (len(r) === 0) return r.start;
  const skip = Math.max(Math.floor(len(r) / unique), 1);
  let index = r.start + skip;
  for (; !(arr[key] < arr[index - 1]); index += skip) { //@cmp-find-last-fwd
    if (index >= r.end - skip) return binaryLast(arr, key, range(index, r.end));
  }
  return binaryLast(arr, key, range(index - skip, index));
}
function findFirstBackward(arr, key, r, unique) {
  if (len(r) === 0) return r.start;
  const skip = Math.max(Math.floor(len(r) / unique), 1);
  let index = r.end - skip;
  for (; index > r.start && !(arr[index - 1] < arr[key]); index -= skip) { //@cmp-find-first-back
    if (index < r.start + skip) return binaryFirst(arr, key, range(r.start, index));
  }
  return binaryFirst(arr, key, range(index, index + skip));
}
function findLastBackward(arr, key, r, unique) {
  if (len(r) === 0) return r.start;
  const skip = Math.max(Math.floor(len(r) / unique), 1);
  let index = r.end - skip;
  for (; index > r.start && arr[key] < arr[index - 1]; index -= skip) { //@cmp-find-last-back
    if (index < r.start + skip) return binaryLast(arr, key, range(r.start, index));
  }
  return binaryLast(arr, key, range(index, index + skip));
}

// 구간 r을 왼쪽으로 amount칸 회전 (세 번 뒤집기)
function rotate(arr, amount, r) {
  if (amount <= 0 || amount >= len(r)) return; // 제자리 그대로
  reverse(arr, range(r.start, r.start + amount));
  reverse(arr, range(r.start + amount, r.end));
  reverse(arr, r);
}
function reverse(arr, r) {
  for (let i = r.start, j = r.end - 1; i < j; i++, j--) swap(arr, i, j); //@swap-reverse
}
function swapBlocks(arr, a, b, count) {
  for (let k = 0; k < count; k++) swap(arr, a + k, b + k); //@swap-block
}
function insertionSort(arr, r) {
  for (let i = r.start + 1; i < r.end; i++) {
    for (let j = i; j > r.start && arr[j] < arr[j - 1]; j--) { //@cmp-insert
      swap(arr, j, j - 1); //@swap-insert
    }
  }
  return arr;
}

const range = (start, end) => ({ start, end });
const len = (r) => r.end - r.start;
const swap = (arr, i, j) => ([arr[i], arr[j]] = [arr[j], arr[i]]);`);

const L = Object.fromEntries([...CODE.labels].map(([line, label]) => [label, line])) as Record<string, number>;

type Range = { start: number; end: number };
const range = (start: number, end: number): Range => ({ start, end });
const len = (r: Range) => r.end - r.start;
/** a[i] < a[j] 를 기록하며 비교 */
const less = (t: Tracer, i: number, j: number, line: number) => t.cmp(i, j, line) < 0;

class WikiIterator {
  private numerator = 0;
  private decimal = 0;
  private readonly denominator: number;
  private decimalStep: number;
  private numeratorStep: number;

  constructor(
    private readonly size: number,
    minLevel: number
  ) {
    let pow = 1;
    while (pow * 2 <= size) pow *= 2;
    this.denominator = pow / minLevel;
    this.decimalStep = Math.floor(size / this.denominator);
    this.numeratorStep = size % this.denominator;
  }

  begin() {
    this.numerator = 0;
    this.decimal = 0;
  }

  nextRange(): Range {
    const start = this.decimal;
    this.decimal += this.decimalStep;
    this.numerator += this.numeratorStep;
    if (this.numerator >= this.denominator) {
      this.numerator -= this.denominator;
      this.decimal++;
    }
    return range(start, this.decimal);
  }

  finished() {
    return this.decimal >= this.size;
  }

  nextLevel() {
    this.decimalStep += this.decimalStep;
    this.numeratorStep += this.numeratorStep;
    if (this.numeratorStep >= this.denominator) {
      this.numeratorStep -= this.denominator;
      this.decimalStep++;
    }
    return this.decimalStep < this.size;
  }

  length() {
    return this.decimalStep;
  }
}

function reverse(t: Tracer, r: Range) {
  for (let i = r.start, j = r.end - 1; i < j; i++, j--) t.swap(i, j, L["swap-reverse"]);
}

function rotate(t: Tracer, amount: number, r: Range) {
  if (amount <= 0 || amount >= len(r)) return;
  reverse(t, range(r.start, r.start + amount));
  reverse(t, range(r.start + amount, r.end));
  reverse(t, r);
}

function swapBlocks(t: Tracer, a: number, b: number, count: number) {
  for (let k = 0; k < count; k++) t.swap(a + k, b + k, L["swap-block"]);
}

function insertionSort(t: Tracer, r: Range) {
  for (let i = r.start + 1; i < r.end; i++) {
    for (let j = i; j > r.start && less(t, j, j - 1, L["cmp-insert"]); j--) t.swap(j, j - 1, L["swap-insert"]);
  }
}

function binaryFirst(t: Tracer, key: number, r: Range) {
  let lo = r.start;
  let hi = r.end;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (less(t, mid, key, L["cmp-lower"])) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function binaryLast(t: Tracer, key: number, r: Range) {
  let lo = r.start;
  let hi = r.end;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (!less(t, key, mid, L["cmp-upper"])) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function findFirstForward(t: Tracer, key: number, r: Range, unique: number) {
  if (len(r) === 0) return r.start;
  const skip = Math.max(Math.floor(len(r) / unique), 1);
  let index = r.start + skip;
  for (; less(t, index - 1, key, L["cmp-find-first-fwd"]); index += skip) {
    if (index >= r.end - skip) return binaryFirst(t, key, range(index, r.end));
  }
  return binaryFirst(t, key, range(index - skip, index));
}

function findLastForward(t: Tracer, key: number, r: Range, unique: number) {
  if (len(r) === 0) return r.start;
  const skip = Math.max(Math.floor(len(r) / unique), 1);
  let index = r.start + skip;
  for (; !less(t, key, index - 1, L["cmp-find-last-fwd"]); index += skip) {
    if (index >= r.end - skip) return binaryLast(t, key, range(index, r.end));
  }
  return binaryLast(t, key, range(index - skip, index));
}

function findFirstBackward(t: Tracer, key: number, r: Range, unique: number) {
  if (len(r) === 0) return r.start;
  const skip = Math.max(Math.floor(len(r) / unique), 1);
  let index = r.end - skip;
  for (; index > r.start && !less(t, index - 1, key, L["cmp-find-first-back"]); index -= skip) {
    if (index < r.start + skip) return binaryFirst(t, key, range(r.start, index));
  }
  return binaryFirst(t, key, range(index, index + skip));
}

function findLastBackward(t: Tracer, key: number, r: Range, unique: number) {
  if (len(r) === 0) return r.start;
  const skip = Math.max(Math.floor(len(r) / unique), 1);
  let index = r.end - skip;
  for (; index > r.start && less(t, key, index - 1, L["cmp-find-last-back"]); index -= skip) {
    if (index < r.start + skip) return binaryLast(t, key, range(r.start, index));
  }
  return binaryLast(t, key, range(index, index + skip));
}

function mergeInternal(t: Tracer, A: Range, B: Range, buffer: Range) {
  let aCount = 0;
  let bCount = 0;
  let insert = 0;
  if (len(B) > 0 && len(A) > 0) {
    for (;;) {
      const fromA = !less(t, B.start + bCount, buffer.start + aCount, L["cmp-merge"]);
      t.swap(A.start + insert++, fromA ? buffer.start + aCount++ : B.start + bCount++, L["swap-merge"]);
      if (aCount >= len(A) || bCount >= len(B)) break;
    }
  }
  swapBlocks(t, buffer.start + aCount, A.start + insert, len(A) - aCount);
}

function mergeInPlace(t: Tracer, A: Range, B: Range) {
  while (len(A) > 0 && len(B) > 0) {
    const mid = binaryFirst(t, A.start, B);
    const amount = mid - A.end;
    rotate(t, len(A), range(A.start, mid));
    if (B.end === mid) break;
    B = range(mid, B.end);
    A = range(A.start + amount, B.start);
    A.start = binaryLast(t, A.start, A);
  }
}

type Pull = { from: number; to: number; count: number; range: Range };
const emptyPull = (): Pull => ({ from: 0, to: 0, count: 0, range: range(0, 0) });

/** 한 단계: 내부 버퍼를 만들고, 모든 A·B 쌍을 병합하고, 버퍼를 되돌린다 */
function mergeLevel(t: Tracer, it: WikiIterator) {
  let blockSize = Math.floor(Math.sqrt(it.length()));
  let bufferSize = Math.floor(it.length() / blockSize) + 1;
  let buffer1 = range(0, 0);
  let buffer2 = range(0, 0);
  const pull = [emptyPull(), emptyPull()];
  let pullIndex = 0;
  let find = bufferSize * 2;
  let findSeparately = false;
  if (find > it.length()) {
    find = bufferSize;
    findSeparately = true;
  }

  // 1) 고유 값 찾기
  it.begin();
  while (!it.finished()) {
    const A = it.nextRange();
    const B = it.nextRange();

    let last = A.start;
    let count = 1;
    let index = 0;
    for (; count < find; last = index, count++) {
      index = findLastForward(t, last, range(last + 1, A.end), find - count);
      if (index === A.end) break;
    }
    index = last;
    if (count >= bufferSize) {
      pull[pullIndex] = { range: range(A.start, B.end), count, from: index, to: A.start };
      pullIndex = 1;
      if (count === bufferSize * 2) {
        buffer1 = range(A.start, A.start + bufferSize);
        buffer2 = range(A.start + bufferSize, A.start + count);
        break;
      } else if (find === bufferSize * 2) {
        buffer1 = range(A.start, A.start + count);
        find = bufferSize;
      } else if (findSeparately) {
        buffer1 = range(A.start, A.start + count);
        findSeparately = false;
      } else {
        buffer2 = range(A.start, A.start + count);
        break;
      }
    } else if (pullIndex === 0 && count > len(buffer1)) {
      buffer1 = range(A.start, A.start + count);
      pull[pullIndex] = { range: range(A.start, B.end), count, from: index, to: A.start };
    }

    for (last = B.end - 1, count = 1; count < find; last = index - 1, count++) {
      index = findFirstBackward(t, last, range(B.start, last), find - count);
      if (index === B.start) break;
    }
    index = last;
    if (count >= bufferSize) {
      pull[pullIndex] = { range: range(A.start, B.end), count, from: index, to: B.end };
      pullIndex = 1;
      if (count === bufferSize * 2) {
        buffer1 = range(B.end - count, B.end - bufferSize);
        buffer2 = range(B.end - bufferSize, B.end);
        break;
      } else if (find === bufferSize * 2) {
        buffer1 = range(B.end - count, B.end);
        find = bufferSize;
      } else if (findSeparately) {
        buffer1 = range(B.end - count, B.end);
        findSeparately = false;
      } else {
        if (pull[0].range.start === A.start) pull[0].range.end -= pull[1].count;
        buffer2 = range(B.end - count, B.end);
        break;
      }
    } else if (pullIndex === 0 && count > len(buffer1)) {
      buffer1 = range(B.end - count, B.end);
      pull[pullIndex] = { range: range(A.start, B.end), count, from: index, to: B.end };
    }
  }

  // 2) 뽑아내기
  for (const p of pull) {
    const length = p.count;
    if (p.to < p.from) {
      let index = p.from;
      for (let count = 1; count < length; count++) {
        index = findFirstBackward(t, index - 1, range(p.to, p.from - (count - 1)), length - count);
        const r = range(index + 1, p.from + 1);
        rotate(t, len(r) - count, r);
        p.from = index + count;
      }
    } else if (p.to > p.from) {
      let index = p.from + 1;
      for (let count = 1; count < length; count++) {
        index = findLastForward(t, index, range(index, p.to), length - count);
        rotate(t, count, range(p.from, index - 1));
        p.from = index - 1 - count;
      }
    }
  }
  bufferSize = len(buffer1);
  blockSize = Math.floor(it.length() / bufferSize) + 1;

  // 3) 병합
  it.begin();
  while (!it.finished()) {
    const A = it.nextRange();
    const B = it.nextRange();
    const start = A.start;
    let skip = false;
    for (const p of pull) {
      if (start !== p.range.start || skip) continue;
      if (p.from > p.to) A.start += p.count;
      else if (p.from < p.to) B.end -= p.count;
      if (len(A) === 0 || len(B) === 0) skip = true;
    }
    if (skip) continue;

    if (less(t, B.end - 1, A.start, L["cmp-reversed"])) {
      rotate(t, len(A), range(A.start, B.end));
    } else if (less(t, A.end, A.end - 1, L["cmp-ordered"])) {
      const blockA = range(A.start, A.end);
      const firstA = range(A.start, A.start + (len(blockA) % blockSize));
      for (let indexA = buffer1.start, i = firstA.end; i < blockA.end; indexA++, i += blockSize) {
        t.swap(indexA, i, L["swap-tag"]);
      }
      let lastA = firstA;
      let lastB = range(0, 0);
      const blockB = range(B.start, B.start + Math.min(blockSize, len(B)));
      blockA.start += len(firstA);
      let indexA = buffer1.start;
      if (len(buffer2) > 0) swapBlocks(t, lastA.start, buffer2.start, len(lastA));

      while (len(blockA) > 0) {
        if ((len(lastB) > 0 && !less(t, lastB.end - 1, indexA, L["cmp-drop"])) || len(blockB) === 0) {
          const bSplit = binaryFirst(t, indexA, lastB);
          const bRemaining = lastB.end - bSplit;
          let minA = blockA.start;
          for (let findA = minA + blockSize; findA < blockA.end; findA += blockSize) {
            if (less(t, findA, minA, L["cmp-min-a"])) minA = findA;
          }
          swapBlocks(t, blockA.start, minA, blockSize);
          t.swap(blockA.start, indexA++, L["swap-untag"]);
          if (len(buffer2) > 0) mergeInternal(t, lastA, range(lastA.end, bSplit), buffer2);
          else mergeInPlace(t, lastA, range(lastA.end, bSplit));
          if (len(buffer2) > 0) {
            swapBlocks(t, blockA.start, buffer2.start, blockSize);
            swapBlocks(t, bSplit, blockA.start + blockSize - bRemaining, bRemaining);
          } else {
            rotate(t, blockA.start - bSplit, range(bSplit, blockA.start + blockSize));
          }
          lastA = range(blockA.start - bRemaining, blockA.start - bRemaining + blockSize);
          lastB = range(lastA.end, lastA.end + bRemaining);
          blockA.start += blockSize;
        } else if (len(blockB) < blockSize) {
          rotate(t, blockB.start - blockA.start, range(blockA.start, blockB.end));
          lastB = range(blockA.start, blockA.start + len(blockB));
          blockA.start += len(blockB);
          blockA.end += len(blockB);
          blockB.end = blockB.start;
        } else {
          swapBlocks(t, blockA.start, blockB.start, blockSize);
          lastB = range(blockA.start, blockA.start + blockSize);
          blockA.start += blockSize;
          blockA.end += blockSize;
          blockB.start += blockSize;
          blockB.end = blockB.end > B.end - blockSize ? B.end : blockB.end + blockSize;
        }
      }
      if (len(buffer2) > 0) mergeInternal(t, lastA, range(lastA.end, B.end), buffer2);
      else mergeInPlace(t, lastA, range(lastA.end, B.end));
    }
  }

  // 4) 버퍼 되돌리기
  insertionSort(t, buffer2);
  for (const p of pull) {
    let unique = p.count * 2;
    if (p.from > p.to) {
      const buffer = range(p.range.start, p.range.start + p.count);
      while (len(buffer) > 0) {
        const index = findFirstForward(t, buffer.start, range(buffer.end, p.range.end), unique);
        const amount = index - buffer.end;
        rotate(t, len(buffer), range(buffer.start, index));
        buffer.start += amount + 1;
        buffer.end += amount;
        unique -= 2;
      }
    } else if (p.from < p.to) {
      const buffer = range(p.range.end - p.count, p.range.end);
      while (len(buffer) > 0) {
        const index = findLastBackward(t, buffer.end - 1, range(p.range.start, buffer.start), unique);
        const amount = buffer.start - index;
        rotate(t, amount, range(index, buffer.end));
        buffer.start -= amount;
        buffer.end -= amount + 1;
        unique -= 2;
      }
    }
  }
}

export const blockSort: SortAlgorithm = {
  id: "block",
  name: "블록 정렬",
  category: "special",
  desc: "고유한 값으로 내부 버퍼 두 개를 만들어 A 블록을 B 사이로 굴려 넣는 제자리 안정 병합 정렬 (WikiSort)",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
  },
  stable: true,
  note: "원본 WikiSort는 처음 4~8개 구간을 정렬 네트워크로 정렬하지만 여기서는 같은 결과를 내는 삽입 정렬을 써요. 외부 캐시 없이(보조 메모리 O(1)) 동작하는 경로만 구현했어요.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 4) {
      insertionSort(t, range(0, n));
      return;
    }
    const it = new WikiIterator(n, 4);
    it.begin();
    while (!it.finished()) insertionSort(t, it.nextRange());
    if (n < 8) return;
    for (;;) {
      mergeLevel(t, it);
      if (!it.nextLevel()) break;
    }
  },
};
