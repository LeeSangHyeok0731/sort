import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import type { Tracer } from "../model/tracer";

const CODE = defineCode(`// 그레일 정렬 (GrailSort, Andrey Astrelin) — 보조 메모리 없이 O(n log n) 안정 정렬
function grailSort(arr) {
  const n = arr.length;
  if (n < 16) return insertionSort(arr, 0, n);
  // 블록 길이 ≈ √n (2의 거듭제곱), 블록마다 태그 키가 하나씩 필요
  let blockLen = 1;
  while (blockLen * blockLen < n) blockLen *= 2;
  let keyLen = Math.floor((n - 1) / blockLen) + 1;
  // 1) 서로 다른 값 keyLen + blockLen개를 맨 앞으로 모은다 (키 = 블록 태그, 나머지 = 내부 버퍼)
  const keysFound = findKeys(arr, n, keyLen + blockLen);
  let haveBuffer = true;
  if (keysFound < keyLen + blockLen) {
    // 고유 값이 너무 적으면 회전 병합만으로 정렬
    if (keysFound < 4) return lazyStableSort(arr, 0, n);
    // 버퍼 없이 찾은 키를 태그로만 쓴다
    keyLen = blockLen;
    blockLen = 0;
    haveBuffer = false;
    while (keyLen > keysFound) keyLen /= 2;
  }
  const dataStart = blockLen + keyLen;
  let runLen = haveBuffer ? blockLen : keyLen;
  // 2) 버퍼를 빈자리로 쓰며 길이 2·runLen 런들을 만든다
  buildBlocks(arr, dataStart, n - dataStart, runLen);
  // 3) 런 쌍을 블록으로 나눠 태그로 순서를 정하고 블록 단위로 병합 (런 길이 2배씩)
  while (n - dataStart > (runLen *= 2)) {
    let lblock = blockLen;
    let useBuffer = haveBuffer;
    if (!haveBuffer) {
      if (keyLen > 4 && (keyLen / 8) * keyLen >= runLen) {
        // 키가 넉넉하면 키의 뒤쪽 절반을 버퍼로 쓴다
        lblock = keyLen / 2;
        useBuffer = true;
      } else {
        let nk = 1;
        for (let s = Math.floor((runLen * keysFound) / 2); nk < keyLen && s !== 0; s = Math.floor(s / 8)) nk *= 2;
        lblock = (2 * runLen) / nk;
      }
    }
    combineBlocks(arr, 0, dataStart, n - dataStart, runLen, lblock, useBuffer);
  }
  // 4) 키·버퍼를 정렬해 나머지와 합친다 (키는 각 값의 첫 등장이라 앞에 와도 안정)
  insertionSort(arr, 0, dataStart);
  mergeWithoutBuffer(arr, 0, dataStart, n - dataStart);
  return arr;
}

// 서로 다른 값의 첫 등장을 정렬된 채로 앞에 모은다. 찾은 개수를 반환
function findKeys(arr, n, wanted) {
  let h = 1, h0 = 0; // 키 영역 [h0, h0 + h)
  for (let u = 1; u < n && h < wanted; u++) {
    const r = binSearchLeft(arr, h0, h, u);
    if (r === h || arr[u] !== arr[h0 + r]) { //@cmp-key
      // 키 영역을 u 바로 앞으로 끌고 와서 arr[u]를 키 사이 제자리에 끼운다
      rotate(arr, h0, h, u - (h0 + h));
      h0 = u - h;
      rotate(arr, h0 + r, h - r, 1);
      h++;
    }
  }
  rotate(arr, 0, h0, h);
  return h;
}

// 버퍼(데이터 바로 앞 K칸)를 빈자리로 쓰며 길이 2K 런을 만든다
function buildBlocks(arr, start, L, K) {
  // 둘씩 정렬하면서 두 칸 왼쪽으로 옮긴다 (버퍼 두 칸이 뒤로 간다)
  for (let m = 1; m < L; m += 2) {
    const u = arr[start + m - 1] > arr[start + m] ? 1 : 0; //@cmp-build-pair
    swap(arr, start + m - 3, start + m - 1 + u); swap(arr, start + m - 2, start + m - u); //@swap-build-pair
  }
  if (L % 2) swap(arr, start + L - 1, start + L - 3); //@swap-build-odd
  start -= 2;
  // 길이 h 런 둘을 버퍼로 병합하며 h칸씩 왼쪽으로 (h = 2, 4, ..., K/2)
  for (let h = 2; h < K; h *= 2) {
    let p0 = 0;
    for (; p0 + 2 * h <= L; p0 += 2 * h) mergeLeft(arr, start + p0, h, h, h);
    const rest = L - p0;
    if (rest > h) mergeLeft(arr, start + p0, h, rest - h, h);
    else rotate(arr, start + p0 - h, h, rest);
    start -= h;
  }
  // 이제 버퍼는 맨 뒤. 오른쪽부터 런 둘씩 병합하며 버퍼를 다시 앞으로 보낸다
  const restK = L % (2 * K);
  let p = L - restK;
  if (restK <= K) rotate(arr, start + p, restK, K);
  else mergeRight(arr, start + p, K, restK - K, K);
  while (p > 0) {
    p -= 2 * K;
    mergeRight(arr, start + p, K, K, K);
  }
}

// A=[start, +L1)와 B=그 뒤 L2개를 병합해 M칸 왼쪽(버퍼)부터 채운다. 버퍼는 뒤로 밀려난다
function mergeLeft(arr, start, L1, L2, M) {
  let p0 = 0, p1 = L1, out = -M;
  L2 += L1;
  while (p1 < L2) {
    const fromB = p0 === L1 || arr[start + p0] > arr[start + p1]; //@cmp-merge-left
    swap(arr, start + out++, start + (fromB ? p1++ : p0++)); //@swap-merge-left
  }
  if (out !== p0) swapBlocks(arr, start + out, start + p0, L1 - p0);
}

// 같은 병합을 오른쪽 끝부터: 버퍼는 B 뒤 M칸이고, 끝나면 앞으로 밀려난다
// (M = A의 길이라서 A를 다 옮기고 남은 B 값은 이미 제자리)
function mergeRight(arr, start, L1, L2, M) {
  let out = L1 + L2 + M - 1, p2 = L1 + L2 - 1, p1 = L1 - 1;
  while (p1 >= 0) {
    const fromA = p2 < L1 || arr[start + p1] > arr[start + p2]; //@cmp-merge-right
    swap(arr, start + out--, start + (fromA ? p1-- : p2--)); //@swap-merge-right
  }
}

// 길이 LL 런 쌍을 블록으로 나눠 (첫 원소, 같으면 태그) 순으로 선택 정렬한 뒤 차례로 병합
function combineBlocks(arr, keys, start, len, LL, lblock, haveBuffer) {
  const M = Math.floor(len / (2 * LL));
  let lrest = len % (2 * LL);
  if (lrest <= LL) {
    len -= lrest; // 짝이 없는 마지막 런은 이미 정렬돼 있다
    lrest = 0;
  }
  for (let b = 0; b <= M; b++) {
    if (b === M && lrest === 0) break;
    const a1 = start + b * 2 * LL;
    const nBlocks = Math.floor((b === M ? lrest : 2 * LL) / lblock);
    insertionSort(arr, keys, keys + nBlocks + (b === M ? 1 : 0)); // 태그를 다시 순서대로
    let midkey = LL / lblock; // 첫 B 블록의 태그 위치 (이보다 작은 태그 = A 블록)
    for (let u = 1; u < nBlocks; u++) {
      let p = u - 1;
      for (let v = u; v < nBlocks; v++) {
        const kc = cmp(arr[a1 + p * lblock], arr[a1 + v * lblock]); //@cmp-select-block
        if (kc > 0 || (kc === 0 && arr[keys + p] > arr[keys + v])) p = v; //@cmp-select-key
      }
      if (p !== u - 1) {
        swapBlocks(arr, a1 + (u - 1) * lblock, a1 + p * lblock, lblock);
        swap(arr, keys + u - 1, keys + p); //@swap-select-key
        if (midkey === u - 1 || midkey === p) midkey ^= (u - 1) ^ p;
      }
    }
    // 마지막 조각(블록보다 짧은 B 꼬리) 앞에 와야 할 블록 수
    let nbl2 = 0;
    const llast = b === M ? lrest % lblock : 0;
    if (llast !== 0) {
      while (nbl2 < nBlocks && arr[a1 + nBlocks * lblock] < arr[a1 + (nBlocks - nbl2 - 1) * lblock]) nbl2++; //@cmp-last-block
    }
    mergeBlocks(arr, keys, keys + midkey, a1, nBlocks - nbl2, lblock, haveBuffer, nbl2, llast);
  }
  // 병합하면서 버퍼가 lblock칸 왼쪽으로 밀렸으므로 전체를 오른쪽으로 되돌린다
  if (haveBuffer) for (let i = len - 1; i >= 0; i--) swap(arr, start + i, start + i - lblock); //@swap-shift-back
}

// 정렬된 블록들을 왼쪽부터 병합. A·B 블록이 바뀌는 곳만 병합하면 된다
function mergeBlocks(arr, keys, midkey, start, nblock, lblock, haveBuffer, nblock2, llast) {
  if (nblock === 0) {
    const l = nblock2 * lblock;
    if (haveBuffer) mergeLeft(arr, start, l, llast, lblock);
    else mergeWithoutBuffer(arr, start, l, llast);
    return;
  }
  let lrest = lblock;
  let frest = arr[keys] < arr[midkey] ? 0 : 1; //@cmp-tag-first
  let pidx = lblock;
  for (let cidx = 1; cidx < nblock; cidx++, pidx += lblock) {
    const prest = pidx - lrest;
    const fnext = arr[keys + cidx] < arr[midkey] ? 0 : 1; //@cmp-tag
    if (fnext === frest) {
      // 같은 쪽 블록이 이어지면 남은 조각은 이미 제자리 (버퍼만 넘겨준다)
      if (haveBuffer) swapBlocks(arr, start + prest - lblock, start + prest, lrest);
      lrest = lblock;
    } else if (haveBuffer) {
      [lrest, frest] = smartMergeWithBuffer(arr, start + prest, lrest, frest, lblock, lblock);
    } else {
      [lrest, frest] = smartMergeWithoutBuffer(arr, start + prest, lrest, frest, lblock);
    }
  }
  let prest = pidx - lrest;
  if (llast) {
    if (frest) {
      if (haveBuffer) swapBlocks(arr, start + prest - lblock, start + prest, lrest);
      prest = pidx;
      lrest = lblock * nblock2;
      frest = 0;
    } else {
      lrest += lblock * nblock2;
    }
    if (haveBuffer) mergeLeft(arr, start + prest, lrest, llast, lblock);
    else mergeWithoutBuffer(arr, start + prest, lrest, llast);
  } else if (haveBuffer) {
    swapBlocks(arr, start + prest, start + prest - lblock, lrest);
  }
}

// 남은 조각(길이 len1, 종류 type: 0 = A, 1 = B)과 다음 블록을 버퍼로 병합. 새로 남는 조각을 반환
function smartMergeWithBuffer(arr, start, len1, type, len2, lkeys) {
  let p0 = -lkeys, p1 = 0, p2 = len1, q1 = p2, q2 = p2 + len2;
  const ftype = 1 - type; // 같은 값이면 A 쪽이 먼저 (안정)
  while (p1 < q1 && p2 < q2) {
    const fromLeft = cmp(arr[start + p1], arr[start + p2]) - ftype < 0; //@cmp-smart
    swap(arr, start + p0++, start + (fromLeft ? p1++ : p2++)); //@swap-smart
  }
  if (p1 < q1) {
    const left = q1 - p1;
    while (p1 < q1) swap(arr, start + --q1, start + --q2); //@swap-smart-rest
    return [left, type];
  }
  return [q2 - p2, ftype];
}

// 같은 일을 버퍼 없이: 이진 탐색 + 회전
function smartMergeWithoutBuffer(arr, start, len1, type, len2) {
  const ftype = 1 - type;
  if (len1 > 0 && cmp(arr[start + len1 - 1], arr[start + len1]) - ftype >= 0) { //@cmp-smart-nobuf
    while (len1 > 0) {
      const h = ftype ? binSearchLeft(arr, start + len1, len2, start) : binSearchRight(arr, start + len1, len2, start);
      if (h !== 0) {
        rotate(arr, start, len1, h);
        start += h;
        len2 -= h;
      }
      if (len2 === 0) return [len1, type];
      do {
        start++;
        len1--;
      } while (len1 > 0 && cmp(arr[start], arr[start + len1]) - ftype < 0); //@cmp-smart-nobuf-scan
    }
  }
  return [len2, ftype];
}

// 보조 메모리 없는 병합: 짧은 쪽 원소의 자리를 긴 쪽에서 이진 탐색해 회전으로 끼운다
function mergeWithoutBuffer(arr, start, len1, len2) {
  if (len1 < len2) {
    while (len1 > 0) {
      const h = binSearchLeft(arr, start + len1, len2, start);
      if (h !== 0) {
        rotate(arr, start, len1, h);
        start += h;
        len2 -= h;
      }
      if (len2 === 0) break;
      do {
        start++;
        len1--;
      } while (len1 > 0 && arr[start] <= arr[start + len1]); //@cmp-nobuf-left
    }
  } else {
    while (len2 > 0) {
      const h = binSearchRight(arr, start, len1, start + len1 + len2 - 1);
      if (h !== len1) {
        rotate(arr, start + h, len1 - h, len2);
        len1 = h;
      }
      if (len1 === 0) break;
      do {
        len2--;
      } while (len2 > 0 && arr[start + len1 - 1] <= arr[start + len1 + len2 - 1]); //@cmp-nobuf-right
    }
  }
}

// 고유 값이 3개 이하일 때: 둘씩 정렬한 뒤 버퍼 없는 병합으로 상향식 병합 정렬
function lazyStableSort(arr, start, n) {
  for (let m = 1; m < n; m += 2) {
    if (arr[start + m - 1] > arr[start + m]) { //@cmp-lazy
      swap(arr, start + m - 1, start + m); //@swap-lazy
    }
  }
  for (let h = 2; h < n; h *= 2) {
    let p0 = 0;
    for (; p0 + 2 * h <= n; p0 += 2 * h) mergeWithoutBuffer(arr, start + p0, h, h);
    const rest = n - p0;
    if (rest > h) mergeWithoutBuffer(arr, start + p0, h, rest - h);
  }
  return arr;
}

// [start, start+l1)과 그 뒤 l2개의 순서를 바꾼다 (짧은 쪽 길이만큼 블록 맞바꾸기 반복)
function rotate(arr, start, l1, l2) {
  while (l1 > 0 && l2 > 0) {
    if (l1 <= l2) {
      swapBlocks(arr, start, start + l1, l1);
      start += l1;
      l2 -= l1;
    } else {
      swapBlocks(arr, start + l1 - l2, start + l1, l2);
      l1 -= l2;
    }
  }
}

function swapBlocks(arr, a, b, len) {
  for (let k = 0; k < len; k++) swap(arr, a + k, b + k); //@swap-block
}

// [start, start+len)에서 arr[key] 이상인 첫 위치 (start 기준 거리)
function binSearchLeft(arr, start, len, key) {
  let lo = 0, hi = len;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[start + mid] < arr[key]) lo = mid + 1; //@cmp-search-left
    else hi = mid;
  }
  return lo;
}

// [start, start+len)에서 arr[key]보다 큰 첫 위치
function binSearchRight(arr, start, len, key) {
  let lo = 0, hi = len;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[start + mid] <= arr[key]) lo = mid + 1; //@cmp-search-right
    else hi = mid;
  }
  return lo;
}

function insertionSort(arr, lo, hi) {
  for (let i = lo + 1; i < hi; i++) {
    for (let j = i; j > lo && arr[j - 1] > arr[j]; j--) { //@cmp-insert
      swap(arr, j - 1, j); //@swap-insert
    }
  }
  return arr;
}

const cmp = (a, b) => Math.sign(a - b);
const swap = (arr, i, j) => ([arr[i], arr[j]] = [arr[j], arr[i]]);`);

const L = Object.fromEntries([...CODE.labels].map(([line, label]) => [label, line])) as Record<string, number>;

/** a[i]와 a[j]를 비교한 부호 (-1, 0, 1) */
const sign = (t: Tracer, i: number, j: number, line: number) => Math.sign(t.cmp(i, j, line));

function swapBlocks(t: Tracer, a: number, b: number, len: number) {
  for (let k = 0; k < len; k++) t.swap(a + k, b + k, L["swap-block"]);
}

function rotate(t: Tracer, start: number, l1: number, l2: number) {
  while (l1 > 0 && l2 > 0) {
    if (l1 <= l2) {
      swapBlocks(t, start, start + l1, l1);
      start += l1;
      l2 -= l1;
    } else {
      swapBlocks(t, start + l1 - l2, start + l1, l2);
      l1 -= l2;
    }
  }
}

function binSearchLeft(t: Tracer, start: number, len: number, key: number) {
  let lo = 0;
  let hi = len;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (t.cmp(start + mid, key, L["cmp-search-left"]) < 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function binSearchRight(t: Tracer, start: number, len: number, key: number) {
  let lo = 0;
  let hi = len;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (t.cmp(start + mid, key, L["cmp-search-right"]) <= 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function insertionSort(t: Tracer, lo: number, hi: number) {
  for (let i = lo + 1; i < hi; i++) {
    for (let j = i; j > lo && t.cmp(j - 1, j, L["cmp-insert"]) > 0; j--) t.swap(j - 1, j, L["swap-insert"]);
  }
}

function findKeys(t: Tracer, n: number, wanted: number) {
  let h = 1;
  let h0 = 0;
  for (let u = 1; u < n && h < wanted; u++) {
    const r = binSearchLeft(t, h0, h, u);
    if (r === h || t.cmp(u, h0 + r, L["cmp-key"]) !== 0) {
      rotate(t, h0, h, u - (h0 + h));
      h0 = u - h;
      rotate(t, h0 + r, h - r, 1);
      h++;
    }
  }
  rotate(t, 0, h0, h);
  return h;
}

function mergeLeft(t: Tracer, start: number, L1: number, L2: number, M: number) {
  let p0 = 0;
  let p1 = L1;
  let out = -M;
  L2 += L1;
  while (p1 < L2) {
    const fromB = p0 === L1 || t.cmp(start + p0, start + p1, L["cmp-merge-left"]) > 0;
    t.swap(start + out++, start + (fromB ? p1++ : p0++), L["swap-merge-left"]);
  }
  if (out !== p0) swapBlocks(t, start + out, start + p0, L1 - p0);
}

function mergeRight(t: Tracer, start: number, L1: number, L2: number, M: number) {
  let out = L1 + L2 + M - 1;
  let p2 = L1 + L2 - 1;
  let p1 = L1 - 1;
  while (p1 >= 0) {
    const fromA = p2 < L1 || t.cmp(start + p1, start + p2, L["cmp-merge-right"]) > 0;
    t.swap(start + out--, start + (fromA ? p1-- : p2--), L["swap-merge-right"]);
  }
}

function buildBlocks(t: Tracer, start: number, len: number, K: number) {
  for (let m = 1; m < len; m += 2) {
    const u = t.cmp(start + m - 1, start + m, L["cmp-build-pair"]) > 0 ? 1 : 0;
    t.swap(start + m - 3, start + m - 1 + u, L["swap-build-pair"]);
    t.swap(start + m - 2, start + m - u, L["swap-build-pair"]);
  }
  if (len % 2) t.swap(start + len - 1, start + len - 3, L["swap-build-odd"]);
  start -= 2;
  for (let h = 2; h < K; h *= 2) {
    let p0 = 0;
    for (; p0 + 2 * h <= len; p0 += 2 * h) mergeLeft(t, start + p0, h, h, h);
    const rest = len - p0;
    if (rest > h) mergeLeft(t, start + p0, h, rest - h, h);
    else rotate(t, start + p0 - h, h, rest);
    start -= h;
  }
  const restK = len % (2 * K);
  let p = len - restK;
  if (restK <= K) rotate(t, start + p, restK, K);
  else mergeRight(t, start + p, K, restK - K, K);
  while (p > 0) {
    p -= 2 * K;
    mergeRight(t, start + p, K, K, K);
  }
}

function mergeWithoutBuffer(t: Tracer, start: number, len1: number, len2: number) {
  if (len1 < len2) {
    while (len1 > 0) {
      const h = binSearchLeft(t, start + len1, len2, start);
      if (h !== 0) {
        rotate(t, start, len1, h);
        start += h;
        len2 -= h;
      }
      if (len2 === 0) break;
      do {
        start++;
        len1--;
      } while (len1 > 0 && t.cmp(start, start + len1, L["cmp-nobuf-left"]) <= 0);
    }
  } else {
    while (len2 > 0) {
      const h = binSearchRight(t, start, len1, start + len1 + len2 - 1);
      if (h !== len1) {
        rotate(t, start + h, len1 - h, len2);
        len1 = h;
      }
      if (len1 === 0) break;
      do {
        len2--;
      } while (len2 > 0 && t.cmp(start + len1 - 1, start + len1 + len2 - 1, L["cmp-nobuf-right"]) <= 0);
    }
  }
}

function lazyStableSort(t: Tracer, start: number, n: number) {
  for (let m = 1; m < n; m += 2) {
    if (t.cmp(start + m - 1, start + m, L["cmp-lazy"]) > 0) t.swap(start + m - 1, start + m, L["swap-lazy"]);
  }
  for (let h = 2; h < n; h *= 2) {
    let p0 = 0;
    for (; p0 + 2 * h <= n; p0 += 2 * h) mergeWithoutBuffer(t, start + p0, h, h);
    const rest = n - p0;
    if (rest > h) mergeWithoutBuffer(t, start + p0, h, rest - h);
  }
}

type Rest = [length: number, type: number];

function smartMergeWithBuffer(t: Tracer, start: number, len1: number, type: number, len2: number, lkeys: number): Rest {
  let p0 = -lkeys;
  let p1 = 0;
  let p2 = len1;
  let q1 = p2;
  let q2 = p2 + len2;
  const ftype = 1 - type;
  while (p1 < q1 && p2 < q2) {
    const fromLeft = sign(t, start + p1, start + p2, L["cmp-smart"]) - ftype < 0;
    t.swap(start + p0++, start + (fromLeft ? p1++ : p2++), L["swap-smart"]);
  }
  if (p1 < q1) {
    const left = q1 - p1;
    while (p1 < q1) t.swap(start + --q1, start + --q2, L["swap-smart-rest"]);
    return [left, type];
  }
  return [q2 - p2, ftype];
}

function smartMergeWithoutBuffer(t: Tracer, start: number, len1: number, type: number, len2: number): Rest {
  const ftype = 1 - type;
  if (len1 > 0 && sign(t, start + len1 - 1, start + len1, L["cmp-smart-nobuf"]) - ftype >= 0) {
    while (len1 > 0) {
      const h = ftype ? binSearchLeft(t, start + len1, len2, start) : binSearchRight(t, start + len1, len2, start);
      if (h !== 0) {
        rotate(t, start, len1, h);
        start += h;
        len2 -= h;
      }
      if (len2 === 0) return [len1, type];
      do {
        start++;
        len1--;
      } while (len1 > 0 && sign(t, start, start + len1, L["cmp-smart-nobuf-scan"]) - ftype < 0);
    }
  }
  return [len2, ftype];
}

function mergeBlocks(
  t: Tracer,
  keys: number,
  midkey: number,
  start: number,
  nblock: number,
  lblock: number,
  haveBuffer: boolean,
  nblock2: number,
  llast: number
) {
  if (nblock === 0) {
    const l = nblock2 * lblock;
    if (haveBuffer) mergeLeft(t, start, l, llast, lblock);
    else mergeWithoutBuffer(t, start, l, llast);
    return;
  }
  let lrest = lblock;
  let frest = t.cmp(keys, midkey, L["cmp-tag-first"]) < 0 ? 0 : 1;
  let pidx = lblock;
  for (let cidx = 1; cidx < nblock; cidx++, pidx += lblock) {
    const prest = pidx - lrest;
    const fnext = t.cmp(keys + cidx, midkey, L["cmp-tag"]) < 0 ? 0 : 1;
    if (fnext === frest) {
      if (haveBuffer) swapBlocks(t, start + prest - lblock, start + prest, lrest);
      lrest = lblock;
    } else if (haveBuffer) {
      [lrest, frest] = smartMergeWithBuffer(t, start + prest, lrest, frest, lblock, lblock);
    } else {
      [lrest, frest] = smartMergeWithoutBuffer(t, start + prest, lrest, frest, lblock);
    }
  }
  let prest = pidx - lrest;
  if (llast) {
    if (frest) {
      if (haveBuffer) swapBlocks(t, start + prest - lblock, start + prest, lrest);
      prest = pidx;
      lrest = lblock * nblock2;
      frest = 0;
    } else {
      lrest += lblock * nblock2;
    }
    if (haveBuffer) mergeLeft(t, start + prest, lrest, llast, lblock);
    else mergeWithoutBuffer(t, start + prest, lrest, llast);
  } else if (haveBuffer) {
    swapBlocks(t, start + prest, start + prest - lblock, lrest);
  }
}

function combineBlocks(
  t: Tracer,
  keys: number,
  start: number,
  len: number,
  LL: number,
  lblock: number,
  haveBuffer: boolean
) {
  const M = Math.floor(len / (2 * LL));
  let lrest = len % (2 * LL);
  if (lrest <= LL) {
    len -= lrest;
    lrest = 0;
  }
  for (let b = 0; b <= M; b++) {
    if (b === M && lrest === 0) break;
    const a1 = start + b * 2 * LL;
    const nBlocks = Math.floor((b === M ? lrest : 2 * LL) / lblock);
    insertionSort(t, keys, keys + nBlocks + (b === M ? 1 : 0));
    let midkey = LL / lblock;
    for (let u = 1; u < nBlocks; u++) {
      let p = u - 1;
      for (let v = u; v < nBlocks; v++) {
        const kc = t.cmp(a1 + p * lblock, a1 + v * lblock, L["cmp-select-block"]);
        if (kc > 0 || (kc === 0 && t.cmp(keys + p, keys + v, L["cmp-select-key"]) > 0)) p = v;
      }
      if (p !== u - 1) {
        swapBlocks(t, a1 + (u - 1) * lblock, a1 + p * lblock, lblock);
        t.swap(keys + u - 1, keys + p, L["swap-select-key"]);
        if (midkey === u - 1 || midkey === p) midkey ^= (u - 1) ^ p;
      }
    }
    let nbl2 = 0;
    const llast = b === M ? lrest % lblock : 0;
    if (llast !== 0) {
      while (
        nbl2 < nBlocks &&
        t.cmp(a1 + nBlocks * lblock, a1 + (nBlocks - nbl2 - 1) * lblock, L["cmp-last-block"]) < 0
      )
        nbl2++;
    }
    mergeBlocks(t, keys, keys + midkey, a1, nBlocks - nbl2, lblock, haveBuffer, nbl2, llast);
  }
  if (haveBuffer) for (let i = len - 1; i >= 0; i--) t.swap(start + i, start + i - lblock, L["swap-shift-back"]);
}

export const grailSort: SortAlgorithm = {
  id: "grail",
  name: "그레일 정렬",
  category: "special",
  desc: "고유한 값 √n개를 태그·내부 버퍼로 써서 블록 병합하는 제자리 안정 정렬",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
  },
  stable: true,
  note: "고유한 값이 충분하지 않으면 태그만 쓰거나(버퍼 없는 블록 병합), 3개 이하일 때는 회전 병합으로 정렬해요.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    if (n < 16) {
      insertionSort(t, 0, n);
      return;
    }
    let blockLen = 1;
    while (blockLen * blockLen < n) blockLen *= 2;
    let keyLen = Math.floor((n - 1) / blockLen) + 1;
    const keysFound = findKeys(t, n, keyLen + blockLen);
    let haveBuffer = true;
    if (keysFound < keyLen + blockLen) {
      if (keysFound < 4) {
        lazyStableSort(t, 0, n);
        return;
      }
      keyLen = blockLen;
      blockLen = 0;
      haveBuffer = false;
      while (keyLen > keysFound) keyLen /= 2;
    }
    const dataStart = blockLen + keyLen;
    let runLen = haveBuffer ? blockLen : keyLen;
    buildBlocks(t, dataStart, n - dataStart, runLen);
    while (n - dataStart > (runLen *= 2)) {
      let lblock = blockLen;
      let useBuffer = haveBuffer;
      if (!haveBuffer) {
        if (keyLen > 4 && (keyLen / 8) * keyLen >= runLen) {
          lblock = keyLen / 2;
          useBuffer = true;
        } else {
          let nk = 1;
          for (let s = Math.floor((runLen * keysFound) / 2); nk < keyLen && s !== 0; s = Math.floor(s / 8)) nk *= 2;
          lblock = (2 * runLen) / nk;
        }
      }
      combineBlocks(t, 0, dataStart, n - dataStart, runLen, lblock, useBuffer);
    }
    insertionSort(t, 0, dataStart);
    mergeWithoutBuffer(t, 0, dataStart, n - dataStart);
  },
};
