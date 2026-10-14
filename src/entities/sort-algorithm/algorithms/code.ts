/** 화면에 보여줄 설명용 코드 (시각화는 같은 알고리즘을 Tracer 연산으로 구현한 버전으로 동작한다) */

export const ALGO_CODE: Record<string, string> = {
  bubble: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    // 끝에서부터 i번째 요소는 이미 정렬됨
    for (let j = 0; j < n - i - 1; j++) {
      // 인접한 두 요소를 비교
      if (arr[j] > arr[j + 1]) {
        // 더 큰 값을 뒤로 보냄 (Swap)
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  selection: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    // 아직 정렬되지 않은 부분에서 최솟값 찾기
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    // 찾은 최솟값을 현재 위치와 교체
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
  insertion: `function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    // key보다 큰 요소들을 한 칸씩 뒤로 밀어냄
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    // 적절한 위치에 key 삽입
    arr[j + 1] = key;
  }
  return arr;
}`,
  quick: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // 피벗을 기준으로 배열 분할
    const pivotIdx = partition(arr, low, high);
    // 재귀적으로 왼쪽과 오른쪽 정렬
    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high]; // 마지막 요소를 피벗으로 선택
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
  merge: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  // 배열을 반으로 나누어 각각 정렬
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  // 정렬된 두 배열을 병합
  return merge(left, right);
}

function merge(left, right) {
  let result = [], i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}`,
  heap: `function heapSort(arr) {
  const n = arr.length;
  // 최대 힙 생성
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  // 하나씩 꺼내서 정렬
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i, l = 2 * i + 1, r = 2 * i + 2;
  if (l < n && arr[l] > arr[largest]) largest = l;
  if (r < n && arr[r] > arr[largest]) largest = r;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
  shell: `function shellSort(arr) {
  const n = arr.length;
  // 간격(Gap)을 줄여가며 삽입 정렬 수행
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = arr[i], j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
  return arr;
}`,
  counting: `function countingSort(arr) {
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  // 각 숫자의 빈도수 계산
  for (let num of arr) count[num]++;
  // 누적 합 계산
  for (let i = 1; i <= max; i++) count[i] += count[i - 1];
  // 결과 배열 생성
  const output = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  return output;
}`,
  radix: `function radixSort(arr) {
  const max = Math.max(...arr);
  // 각 자릿수(1, 10, 100...) 별로 계수 정렬 수행
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
  return arr;
}

function countingSortByDigit(arr, exp) {
  const output = new Array(arr.length);
  const count = new Array(10).fill(0);
  for (let i = 0; i < arr.length; i++) count[Math.floor(arr[i] / exp) % 10]++;
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];
  for (let i = arr.length - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  for (let i = 0; i < arr.length; i++) arr[i] = output[i];
}`,
  bucket: `function bucketSort(arr, bucketCount = 5) {
  const min = Math.min(...arr), max = Math.max(...arr);
  const buckets = Array.from({ length: bucketCount }, () => []);
  // 범위별로 버킷에 분산 투입
  for (let val of arr) {
    let biz = Math.floor(((val - min) / (max - min)) * (bucketCount - 1));
    buckets[biz].push(val);
  }
  // 각 버킷 정렬 후 병합
  return buckets.reduce((acc, b) => [...acc, ...b.sort((x, y) => x - y)], []);
}`,
  tim: `function timSort(arr) {
  const MIN_RUN = 32;
  const n = arr.length;
  // 작은 단위(Run)로 나누어 삽입 정렬
  for (let i = 0; i < n; i += MIN_RUN) {
    insertionSort(arr, i, Math.min(i + MIN_RUN - 1, n - 1));
  }
  // 정렬된 Run들을 병합 정렬 방식으로 병합
  for (let size = MIN_RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = left + size - 1;
      const right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) merge(arr, left, mid, right);
    }
  }
  return arr;
}`,
  comb: `function combSort(arr) {
  let gap = arr.length, shrink = 1.3, sorted = false;
  // 버블 정렬과 비슷하지만 큰 간격부터 비교하여 효율 개선
  while (!sorted) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) { gap = 1; sorted = true; }
    for (let i = 0; i + gap < arr.length; i++) {
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`,
  cocktail: `function cocktailSort(arr) {
  let swapped = true, start = 0, end = arr.length - 1;
  // 앞에서 뒤로, 뒤에서 앞으로 오가며 버블 정렬 수행
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    if (!swapped) break;
    swapped = false; end--;
    for (let i = end - 1; i >= start; i--) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    start++;
  }
  return arr;
}`,
  gnome: `function gnomeSort(arr) {
  let index = 0;
  // 요소가 틀린 위치에 있으면 제자리를 찾을 때까지 뒤로 이동
  while (index < arr.length) {
    if (index === 0 || arr[index] >= arr[index - 1]) index++;
    else {
      [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
      index--;
    }
  }
  return arr;
}`,
  oddEven: `function oddEvenSort(arr) {
  let sorted = false;
  // 홀수/짝수 인덱스 쌍을 번갈아가며 정렬
  while (!sorted) {
    sorted = true;
    for (let i = 1; i < arr.length - 1; i += 2) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        sorted = false;
      }
    }
    for (let i = 0; i < arr.length - 1; i += 2) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`,
  pancake: `function pancakeSort(arr) {
  for (let currSize = arr.length; currSize > 1; currSize--) {
    let maxIdx = findMax(arr, currSize);
    if (maxIdx !== currSize - 1) {
      // 최댓값을 맨 앞으로 보낸 뒤, 다시 맨 뒤로 뒤집음
      flip(arr, maxIdx);
      flip(arr, currSize - 1);
    }
  }
  return arr;
}

function flip(arr, i) {
  let start = 0;
  while (start < i) {
    [arr[start], arr[i]] = [arr[i], arr[start]];
    start++; i--;
  }
}`,
  bitonic: `function bitonicSort(arr, low, cnt, dir) {
  if (cnt > 1) {
    let k = Math.floor(cnt / 2);
    // 비토닉 수열(증가-감소)을 생성한 뒤 병합
    bitonicSort(arr, low, k, true);
    bitonicSort(arr, low + k, k, false);
    bitonicMerge(arr, low, cnt, dir);
  }
}

function bitonicMerge(arr, low, cnt, dir) {
  if (cnt > 1) {
    let k = findGreatestPowerOfTwoLess(cnt);
    for (let i = low; i < low + cnt - k; i++) {
      if (dir === (arr[i] > arr[i + k])) [arr[i], arr[i + k]] = [arr[i + k], arr[i]];
    }
    bitonicMerge(arr, low, k, dir);
    bitonicMerge(arr, low + k, cnt - k, dir);
  }
}`,
  bogo: `function bogoSort(arr) {
  // 정렬이 될 때까지 무작위로 섞음 (매우 비효율적)
  while (!isSorted(arr)) {
    shuffle(arr);
  }
  return arr;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}`,
  intro: `function introSort(arr) {
  let depthLimit = 2 * Math.floor(Math.log2(arr.length));
  // 퀵 정렬로 시작하되, 재귀 깊이가 깊어지면 힙 정렬로 전환
  introSortRecursive(arr, 0, arr.length - 1, depthLimit);
}

function introSortRecursive(arr, low, high, depthLimit) {
  if (high - low < 16) insertionSort(arr, low, high);
  else if (depthLimit === 0) heapSort(arr, low, high);
  else {
    let p = partition(arr, low, high);
    introSortRecursive(arr, low, p, depthLimit - 1);
    introSortRecursive(arr, p + 1, high, depthLimit - 1);
  }
}`,
  tree: `function treeSort(arr) {
  let root = null;
  // 모든 요소를 이진 검색 트리(BST)에 삽입
  for (let x of arr) root = insert(root, x);
  // 중위 순회(In-order Traversal)를 통해 정렬된 결과 추출
  return inOrder(root);
}

function insert(node, val) {
  if (!node) return { val, left: null, right: null };
  if (val < node.val) node.left = insert(node.left, val);
  else node.right = insert(node.right, val);
  return node;
}`,
  stooge: `function stoogeSort(arr, i = 0, j = arr.length - 1) {
  // 양 끝이 뒤집혀 있으면 교환
  if (arr[i] > arr[j]) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (j - i + 1 > 2) {
    const third = Math.floor((j - i + 1) / 3);
    stoogeSort(arr, i, j - third); // 앞 2/3 정렬
    stoogeSort(arr, i + third, j); // 뒤 2/3 정렬
    stoogeSort(arr, i, j - third); // 앞 2/3 다시 정렬
  }
  return arr;
}`,
  slow: `// "곱하고 항복하라(multiply and surrender)" 원칙의 패러디 정렬
function slowSort(arr, i = 0, j = arr.length - 1) {
  if (i >= j) return arr;
  const m = Math.floor((i + j) / 2);
  slowSort(arr, i, m);     // 앞 절반 정렬 → 최댓값이 m에
  slowSort(arr, m + 1, j); // 뒤 절반 정렬 → 최댓값이 j에
  // 둘 중 큰 값을 맨 끝으로
  if (arr[m] > arr[j]) {
    [arr[m], arr[j]] = [arr[j], arr[m]];
  }
  // 최댓값을 뺀 나머지를 처음부터 다시 정렬
  slowSort(arr, i, j - 1);
  return arr;
}`,
  bozo: `function isSorted(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

function bozoSort(arr) {
  while (!isSorted(arr)) {
    // 아무 두 위치나 골라서 바꿔 본다
    const i = Math.floor(Math.random() * arr.length);
    const j = Math.floor(Math.random() * arr.length);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}`,
  miracle: `function isSorted(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

function miracleSort(arr) {
  // 우주선이 메모리 비트를 뒤집어
  // 배열을 정렬해 주기를 기다린다
  while (!isSorted(arr)) {
    // 기도한다 🙏
  }
  return arr;
}`,
  circle: `function circleSort(arr) {
  // 한 바퀴 돌았는데 교환이 없을 때까지 반복
  while (circle(arr, 0, arr.length - 1));
  return arr;
}

function circle(arr, lo, hi) {
  if (lo >= hi) return false;
  let swapped = false;
  let l = lo, h = hi;
  // 양 끝에서 안쪽으로 좁혀 가며 비교
  while (l < h) {
    if (arr[l] > arr[h]) {
      [arr[l], arr[h]] = [arr[h], arr[l]];
      swapped = true;
    }
    l++;
    h--;
  }
  // 길이가 홀수면 가운데와 그 오른쪽을 비교
  if (l === h && arr[l] > arr[h + 1]) {
    [arr[l], arr[h + 1]] = [arr[h + 1], arr[l]];
    swapped = true;
  }
  const mid = Math.floor((lo + hi) / 2);
  const left = circle(arr, lo, mid);
  const right = circle(arr, mid + 1, hi);
  return swapped || left || right;
}`,
  msdRadix: `function msdRadixSort(arr) {
  const max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) >= 10) exp *= 10;
  return msd(arr, exp);
}

function msd(arr, exp) {
  if (arr.length <= 1 || exp < 1) return arr;
  // 현재 자릿수(0~9)로 10개 묶음에 나눈다
  const groups = Array.from({ length: 10 }, () => []);
  for (const x of arr) {
    groups[Math.floor(x / exp) % 10].push(x);
  }
  // 각 묶음을 다음(더 작은) 자릿수로 재귀 정렬해 이어 붙인다
  return groups.flatMap((g) => msd(g, exp / 10));
}`,
  oddEvenMerge: `// Batcher의 홀짝 병합 정렬 네트워크 (반복 버전)
// 어떤 위치끼리 비교할지가 입력과 무관하게 미리 정해져 있다
function oddEvenMergeSort(arr) {
  const n = arr.length;
  for (let p = 1; p < n; p *= 2) {
    for (let k = p; k >= 1; k = Math.floor(k / 2)) {
      for (let j = k % p; j + k < n; j += 2 * k) {
        for (let i = 0; i < k && i + j + k < n; i++) {
          // 같은 2p 크기 블록 안에 있는 쌍만 비교-교환
          const a = i + j, b = i + j + k;
          if (Math.floor(a / (2 * p)) === Math.floor(b / (2 * p)) && arr[a] > arr[b]) {
            [arr[a], arr[b]] = [arr[b], arr[a]];
          }
        }
      }
    }
  }
  return arr;
}`,
  smooth: `// Dijkstra의 스무스 정렬
// 배열을 "레오나르도 힙"들의 숲(forest)으로 관리하는 적응형 힙 정렬.
// 이미 거의 정렬된 배열이면 O(n)에 가깝게 끝난다.

// 레오나르도 수: L(0) = L(1) = 1, L(k) = L(k-1) + L(k-2) + 1
// → 1, 1, 3, 5, 9, 15, 25, 41, 67, 109, ...
// 차수 k인 레오나르도 힙의 크기는 L(k):
//   [왼쪽 자식 힙(차수 k-1)] [오른쪽 자식 힙(차수 k-2)] [루트]
const L = [1, 1];
while (L.length < 46) L.push(L[L.length - 1] + L[L.length - 2] + 1);

function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

// 최하위 0 비트 개수 (예: 0b1000 → 3)
function trailingZeros(x) {
  return 31 - Math.clz32(x & -x);
}

// 숲의 상태는 두 값으로 표현한다.
//   p      : 숲에 있는 힙들의 차수를 비트로 표시 (최하위 비트 = 가장 오른쪽 힙)
//   pshift : 가장 오른쪽(가장 작은) 힙의 차수 — p의 비트 0이 이 차수를 뜻한다

// 차수 order인 힙의 루트 head를 자식들보다 작지 않을 때까지 아래로 내린다
function sift(arr, order, head) {
  while (order > 1) {
    const right = head - 1; // 오른쪽 자식 힙의 루트
    const left = head - 1 - L[order - 2]; // 왼쪽 자식 힙의 루트
    if (arr[head] >= arr[left] && arr[head] >= arr[right]) break;
    if (arr[left] >= arr[right]) {
      swap(arr, head, left);
      head = left;
      order -= 1;
    } else {
      swap(arr, head, right);
      head = right;
      order -= 2;
    }
  }
}

// 숲의 루트들이 왼쪽부터 오름차순이 되도록,
// head를 왼쪽 이웃 힙의 루트(stepson)와 바꿔 가며 왼쪽으로 보낸 뒤 sift 한다.
// trusty: head의 힙이 이미 힙 조건을 만족하는지 (true면 자식 비교를 생략)
function trinkle(arr, p, pshift, head, trusty) {
  while (p !== 1) {
    const stepson = head - L[pshift]; // 왼쪽 이웃 힙의 루트
    if (arr[stepson] <= arr[head]) break;
    if (!trusty && pshift > 1) {
      // 내 자식이 stepson보다 크면, 나를 보내는 대신 sift로 해결된다
      const right = head - 1;
      const left = head - 1 - L[pshift - 2];
      if (arr[right] >= arr[stepson] || arr[left] >= arr[stepson]) break;
    }
    swap(arr, head, stepson);
    head = stepson;
    // 왼쪽 이웃 힙으로 넘어간다: 다음으로 켜진 비트까지 이동
    const trail = trailingZeros(p & ~1);
    p >>>= trail;
    pshift += trail;
    trusty = false;
  }
  if (!trusty) sift(arr, pshift, head);
}

function smoothSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;

  let p = 1; // 처음 숲: 원소 0 하나짜리 힙(차수 1)
  let pshift = 1;
  let head = 0;

  // ── 1단계: 원소를 하나씩 오른쪽에 붙이며 숲을 만든다 ──
  while (head < n - 1) {
    if ((p & 3) === 3) {
      // 가장 오른쪽 두 힙의 차수가 연속(k+1, k)이면
      // 새 원소를 루트로 삼아 차수 k+2 힙 하나로 합친다
      sift(arr, pshift, head);
      p >>>= 2;
      pshift += 2;
    } else {
      // 아니면 새 원소 하나로 크기 1짜리 힙을 만든다.
      // 이 힙이 끝까지 더 커지지 않을 것이면 지금 루트 순서를 맞추고(trinkle),
      // 아직 커질 수 있으면 힙 안에서만 정리(sift)한다
      if (L[pshift - 1] >= n - 1 - head) trinkle(arr, p, pshift, head, false);
      else sift(arr, pshift, head);

      if (pshift === 1) {
        // 차수 1 다음에는 차수 0 힙을 붙인다 (L(1), L(0) 모두 크기 1)
        p <<= 1;
        pshift--;
      } else {
        p <<= pshift - 1;
        pshift = 1;
      }
    }
    p |= 1;
    head++;
  }
  trinkle(arr, p, pshift, head, false);

  // ── 2단계: 가장 오른쪽 루트(= 전체 최댓값)는 이미 제자리 ──
  // 그 힙을 떼어 내고, 남은 두 자식 힙의 루트 순서를 다시 맞춘다
  while (pshift !== 1 || p !== 1) {
    if (pshift <= 1) {
      // 크기 1짜리 힙은 그냥 떼어 낸다
      const trail = trailingZeros(p & ~1);
      p >>>= trail;
      pshift += trail;
    } else {
      // 차수 k 힙을 루트 + 차수 k-1, k-2 두 자식 힙으로 쪼갠다
      p <<= 2;
      p ^= 7;
      pshift -= 2;
      // 왼쪽 자식 힙의 루트, 그다음 오른쪽 자식 힙의 루트를 제자리로
      trinkle(arr, p >>> 1, pshift + 1, head - L[pshift] - 1, true);
      trinkle(arr, p, pshift, head - 1, true);
    }
    head--;
  }
  return arr;
}`,
  quick3: `function quickSort3Way(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const pivot = arr[lo];
  let lt = lo, gt = hi, i = lo + 1;
  // [lo, lt) < pivot,  [lt, i) == pivot,  (gt, hi] > pivot
  while (i <= gt) {
    if (arr[i] < pivot) {
      [arr[lt], arr[i]] = [arr[i], arr[lt]];
      lt++; i++;
    } else if (arr[i] > pivot) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]];
      gt--;
    } else {
      i++; // 피벗과 같은 값은 가운데에 모인다
    }
  }
  // 피벗과 같은 구역은 이미 제자리 → 양쪽만 재귀
  quickSort3Way(arr, lo, lt - 1);
  quickSort3Way(arr, gt + 1, hi);
  return arr;
}`,
  dualPivot: `function dualPivotQuickSort(arr, lo = 0, hi = arr.length - 1) {
  if (hi <= lo) return arr;
  if (arr[lo] > arr[hi]) [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
  const p = arr[lo], q = arr[hi]; // 피벗 두 개 (p <= q)

  let lt = lo + 1, gt = hi - 1, i = lo + 1;
  while (i <= gt) {
    if (arr[i] < p) {
      [arr[i], arr[lt]] = [arr[lt], arr[i]];
      lt++; i++;
    } else if (arr[i] > q) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]];
      gt--;
    } else {
      i++;
    }
  }
  lt--; gt++;
  // 피벗을 경계 위치로
  [arr[lo], arr[lt]] = [arr[lt], arr[lo]];
  [arr[hi], arr[gt]] = [arr[gt], arr[hi]];

  dualPivotQuickSort(arr, lo, lt - 1);   // < p
  dualPivotQuickSort(arr, lt + 1, gt - 1); // p ~ q
  dualPivotQuickSort(arr, gt + 1, hi);   // > q
  return arr;
}`,
  binaryInsertion: `function binaryInsertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    // 이진 탐색으로 key보다 큰 첫 위치를 찾는다 (비교 O(log n))
    let lo = 0, hi = i;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (arr[mid] > key) hi = mid;
      else lo = mid + 1;
    }
    // 하지만 밀어내기(이동)는 여전히 O(n)
    for (let j = i; j > lo; j--) arr[j] = arr[j - 1];
    arr[lo] = key;
  }
  return arr;
}`,
  cycle: `function cycleSort(arr) {
  const n = arr.length;
  for (let start = 0; start < n - 1; start++) {
    let item = arr[start];
    // item보다 작은 원소 수 = item의 최종 위치
    let pos = start;
    for (let i = start + 1; i < n; i++) if (arr[i] < item) pos++;
    if (pos === start) continue; // 이미 제자리

    while (item === arr[pos]) pos++; // 같은 값 건너뛰기
    [arr[pos], item] = [item, arr[pos]]; // 제자리에 쓰고, 밀려난 값을 든다

    // 밀려난 값으로 사이클이 시작 위치로 돌아올 때까지 반복
    while (pos !== start) {
      pos = start;
      for (let i = start + 1; i < n; i++) if (arr[i] < item) pos++;
      while (item === arr[pos]) pos++;
      [arr[pos], item] = [item, arr[pos]];
    }
  }
  return arr;
}`,
  doubleSelection: `function doubleSelectionSort(arr) {
  for (let lo = 0, hi = arr.length - 1; lo < hi; lo++, hi--) {
    let min = lo, max = lo;
    // 한 번 훑으면서 최솟값과 최댓값을 함께 찾는다
    for (let i = lo + 1; i <= hi; i++) {
      if (arr[i] < arr[min]) min = i;
      else if (arr[i] > arr[max]) max = i;
    }
    [arr[lo], arr[min]] = [arr[min], arr[lo]];
    // 최댓값이 lo에 있었다면 방금 min 자리로 옮겨졌다
    if (max === lo) max = min;
    [arr[hi], arr[max]] = [arr[max], arr[hi]];
  }
  return arr;
}`,
  exchange: `function exchangeSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // i번째 자리와 그 뒤 모든 원소를 비교해 더 작으면 바로 교환
    for (let j = i + 1; j < n; j++) {
      if (arr[i] > arr[j]) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  }
  return arr;
}`,
  bottomUpMerge: `function bottomUpMergeSort(arr) {
  const n = arr.length;
  // 크기 1짜리 구간들을 병합 → 크기 2 → 4 → ... (재귀 없음)
  for (let width = 1; width < n; width *= 2) {
    for (let left = 0; left + width < n; left += 2 * width) {
      const mid = left + width - 1;
      const right = Math.min(left + 2 * width - 1, n - 1);
      merge(arr, left, mid, right);
    }
  }
  return arr;
}

function merge(arr, left, mid, right) {
  const L = arr.slice(left, mid + 1);
  const R = arr.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;
  while (i < L.length && j < R.length) {
    arr[k++] = L[i] <= R[j] ? L[i++] : R[j++];
  }
  while (i < L.length) arr[k++] = L[i++];
  while (j < R.length) arr[k++] = R[j++];
}`,
  naturalMerge: `function naturalMergeSort(arr) {
  for (;;) {
    // 이미 오름차순인 구간(런)들을 찾는다
    const runs = [];
    let start = 0;
    for (let i = 1; i <= arr.length; i++) {
      if (i === arr.length || arr[i - 1] > arr[i]) {
        runs.push([start, i - 1]);
        start = i;
      }
    }
    if (runs.length <= 1) return arr; // 런이 하나면 정렬 완료
    // 이웃한 런끼리 병합
    for (let k = 0; k + 1 < runs.length; k += 2) {
      merge(arr, runs[k][0], runs[k][1], runs[k + 1][1]);
    }
  }
}

function merge(arr, left, mid, right) {
  const L = arr.slice(left, mid + 1);
  const R = arr.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;
  while (i < L.length && j < R.length) {
    arr[k++] = L[i] <= R[j] ? L[i++] : R[j++];
  }
  while (i < L.length) arr[k++] = L[i++];
  while (j < R.length) arr[k++] = R[j++];
}`,
  hoareQuick: `function hoareQuickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const p = hoarePartition(arr, lo, hi);
  hoareQuickSort(arr, lo, p);
  hoareQuickSort(arr, p + 1, hi);
  return arr;
}

function hoarePartition(arr, lo, hi) {
  const pivot = arr[Math.floor((lo + hi) / 2)];
  let i = lo - 1, j = hi + 1;
  for (;;) {
    // 왼쪽에서 피벗 이상, 오른쪽에서 피벗 이하인 원소를 찾아
    do i++; while (arr[i] < pivot);
    do j--; while (arr[j] > pivot);
    if (i >= j) return j; // 엇갈리면 분할 완료
    [arr[i], arr[j]] = [arr[j], arr[i]]; // 잘못된 쌍을 교환
  }
}`,
  ternaryHeap: `function ternaryHeapSort(arr) {
  const n = arr.length;
  // 자식이 3개(3i+1, 3i+2, 3i+3)인 최대 힙을 만든다
  for (let i = Math.floor((n - 2) / 3); i >= 0; i--) siftDown(arr, n, i);
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]]; // 최댓값을 뒤로
    siftDown(arr, end, 0);
  }
  return arr;
}

function siftDown(arr, size, i) {
  for (;;) {
    let largest = i;
    for (let c = 3 * i + 1; c <= 3 * i + 3 && c < size; c++) {
      if (arr[c] > arr[largest]) largest = c;
    }
    if (largest === i) return;
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;
  }
}`,
  bottomUpHeap: `function bottomUpHeapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(arr, n, i);
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(arr, end, 0);
  }
  return arr;
}

// Wegener의 상향식 sift-down: 일반 힙 정렬보다 비교가 거의 절반
function siftDown(arr, size, root) {
  // 1) 루트와 비교하지 않고 더 큰 자식만 따라 잎까지 내려간다
  let j = root;
  while (2 * j + 2 < size) j = arr[2 * j + 1] > arr[2 * j + 2] ? 2 * j + 1 : 2 * j + 2;
  if (2 * j + 1 < size) j = 2 * j + 1;
  // 2) 잎에서 올라오며 루트 값이 들어갈 자리를 찾는다
  while (j !== root && arr[j] < arr[root]) j = (j - 1) >> 1;
  // 3) 루트 값을 그 자리에 넣고, 경로의 값들은 한 칸씩 위로
  let x = arr[j];
  arr[j] = arr[root];
  while (j > root) {
    j = (j - 1) >> 1;
    [arr[j], x] = [x, arr[j]];
  }
}`,
  weakHeap: `function weakHeapSort(arr) {
  const n = arr.length;
  if (n < 2) return arr;
  // r[i]: i의 두 자식을 뒤집었는지 (i의 "왼쪽" 자식 = 2i + r[i])
  const r = new Uint8Array(n);

  // j의 구별된 조상: j가 오른쪽 자식이 될 때까지 올라간 뒤의 부모
  const ancestor = (j) => {
    while ((j & 1) === r[j >> 1]) j >>= 1;
    return j >> 1;
  };
  // 조상 i가 j보다 작으면 교환하고, j의 두 자식을 뒤집는다
  const join = (i, j) => {
    if (arr[i] < arr[j]) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      r[j] ^= 1;
    }
  };

  for (let j = n - 1; j >= 1; j--) join(ancestor(j), j);

  for (let end = n - 1; end >= 2; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    // 1번 노드에서 왼쪽 자식만 따라 내려간 뒤 올라오며 루트와 합친다
    let x = 1, y;
    while ((y = 2 * x + r[x]) < end) x = y;
    for (; x > 0; x >>= 1) join(0, x);
  }
  [arr[0], arr[1]] = [arr[1], arr[0]];
  return arr;
}`,
  pigeonhole: `function pigeonholeSort(arr) {
  const min = Math.min(...arr), max = Math.max(...arr);
  // 값마다 칸(비둘기집)을 하나씩 만든다
  const holes = Array.from({ length: max - min + 1 }, () => []);
  // 계수 정렬은 개수만 세지만, 여기선 원소 자체를 칸에 담는다
  for (const x of arr) holes[x - min].push(x);
  // 칸 순서대로 꺼낸다
  let k = 0;
  for (const hole of holes) for (const x of hole) arr[k++] = x;
  return arr;
}`,
  flash: `function flashSort(arr) {
  const n = arr.length;
  const min = Math.min(...arr), max = Math.max(...arr);
  if (min === max) return arr;
  // 1) 값의 분포로 m개 칸 중 어디에 들어갈지 예측
  const m = Math.max(2, Math.floor(0.43 * n));
  const cls = (x) => Math.floor(((m - 1) * (x - min)) / (max - min));
  const count = new Array(m).fill(0);
  for (const x of arr) count[cls(x)]++;

  // 2) 칸별 쓰기 위치를 정하고, 잘못된 칸의 원소를 제 칸으로 던진다
  const next = [], end = [];
  for (let k = 0, pos = 0; k < m; k++) {
    next.push(pos);
    pos += count[k];
    end.push(pos);
  }
  for (let k = 0; k < m; k++) {
    while (next[k] < end[k]) {
      const target = cls(arr[next[k]]);
      if (target === k) next[k]++;
      else {
        const j = next[target]++;
        [arr[next[k]], arr[j]] = [arr[j], arr[next[k]]];
      }
    }
  }

  // 3) 대부분 제자리 근처이므로 삽입 정렬로 마무리
  for (let i = 1; i < n; i++) {
    for (let j = i; j > 0 && arr[j - 1] > arr[j]; j--) {
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
    }
  }
  return arr;
}`,
  americanFlag: `function americanFlagSort(arr) {
  const max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) >= 10) exp *= 10;
  flag(arr, 0, arr.length - 1, exp);
  return arr;
}

function flag(arr, lo, hi, exp) {
  if (hi <= lo || exp < 1) return;
  const digit = (x) => Math.floor(x / exp) % 10;
  // 자릿수(0~9)별 개수를 세서 각 칸의 시작·끝을 정한다
  const count = new Array(10).fill(0);
  for (let i = lo; i <= hi; i++) count[digit(arr[i])]++;
  const next = [], end = [];
  for (let d = 0, pos = lo; d < 10; d++) {
    next.push(pos);
    pos += count[d];
    end.push(pos);
  }
  // 보조 배열 없이 교환만으로 원소를 제 칸에 넣는다
  for (let d = 0; d < 10; d++) {
    while (next[d] < end[d]) {
      const target = digit(arr[next[d]]);
      if (target === d) next[d]++;
      else {
        const j = next[target]++;
        [arr[next[d]], arr[j]] = [arr[j], arr[next[d]]];
      }
    }
  }
  // 각 칸을 다음 자릿수로 재귀
  for (let d = 0, start = lo; d < 10; d++) {
    flag(arr, start, start + count[d] - 1, exp / 10);
    start += count[d];
  }
}`,
  radixExchange: `function radixExchangeSort(arr) {
  const max = Math.max(...arr);
  const topBit = max === 0 ? -1 : 31 - Math.clz32(max);
  sort(arr, 0, arr.length - 1, topBit);
  return arr;
}

// 가장 높은 비트부터, 0인 원소는 왼쪽 1인 원소는 오른쪽으로 (비트 단위 퀵 정렬)
function sort(arr, lo, hi, bit) {
  if (lo >= hi || bit < 0) return;
  const bitOf = (x) => (x >> bit) & 1;
  let i = lo, j = hi;
  while (i <= j) {
    if (bitOf(arr[i]) === 0) i++;
    else if (bitOf(arr[j]) === 1) j--;
    else {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
      j--;
    }
  }
  sort(arr, lo, j, bit - 1); // 0 묶음을 다음 비트로
  sort(arr, i, hi, bit - 1); // 1 묶음을 다음 비트로
}`,
  pdq: `// pdqsort (Pattern-defeating quicksort) 핵심 구조
function pdqsort(arr) {
  pdq(arr, 0, arr.length, Math.floor(Math.log2(arr.length || 1)), true);
  return arr;
}

function pdq(arr, lo, hi, badAllowed, leftmost) {
  for (;;) {
    const size = hi - lo;
    // 작은 구간은 삽입 정렬
    if (size < 24) return insertionSort(arr, lo, hi);

    // 피벗: 세 값의 중앙값(큰 구간은 중앙값들의 중앙값)을 lo로
    choosePivot(arr, lo, hi);

    // 이전 피벗과 같은 값이 많으면 한 번에 건너뛴다
    if (!leftmost && arr[lo - 1] >= arr[lo]) {
      lo = partitionLeft(arr, lo, hi) + 1;
      continue;
    }

    const [p, alreadyPartitioned] = partitionRight(arr, lo, hi);
    const l = p - lo, r = hi - p - 1;

    if (l < size / 8 || r < size / 8) {
      // 분할이 크게 치우쳤다: 너무 자주면 힙 정렬로 전환 (최악 O(n log n) 보장)
      if (--badAllowed === 0) return heapSort(arr, lo, hi);
      // 아니면 원소 몇 개를 섞어 반복 패턴을 깬다
      breakPatterns(arr, lo, p);
      breakPatterns(arr, p + 1, hi);
    } else if (alreadyPartitioned) {
      // 교환이 한 번도 없었다 = 이미 정렬돼 있을 가능성이 크다
      // → 옮김이 8번 이하로 끝나는 "부분 삽입 정렬"로 시도
      if (partialInsertionSort(arr, lo, p) && partialInsertionSort(arr, p + 1, hi)) return;
    }

    pdq(arr, lo, p, badAllowed, leftmost); // 왼쪽은 재귀
    lo = p + 1; // 오른쪽은 반복
    leftmost = false;
  }
}

// 피벗(arr[lo])보다 작은 값은 왼쪽, 같거나 큰 값은 오른쪽
function partitionRight(arr, lo, hi) {
  const pivot = arr[lo];
  let i = lo + 1, j = hi - 1, swapped = false;
  for (;;) {
    while (i <= j && arr[i] < pivot) i++;
    while (i <= j && arr[j] >= pivot) j--;
    if (i > j) break;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++; j--;
    swapped = true;
  }
  [arr[lo], arr[j]] = [arr[j], arr[lo]];
  return [j, !swapped];
}

// 피벗과 같은 값을 왼쪽으로 (왼쪽 구간 전체가 피벗과 같은 값)
function partitionLeft(arr, lo, hi) {
  const pivot = arr[lo];
  let i = lo + 1, j = hi - 1;
  for (;;) {
    while (i <= j && arr[i] <= pivot) i++;
    while (i <= j && arr[j] > pivot) j--;
    if (i > j) break;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++; j--;
  }
  [arr[lo], arr[j]] = [arr[j], arr[lo]];
  return j;
}

function partialInsertionSort(arr, lo, hi) {
  let moved = 0;
  for (let i = lo + 1; i < hi; i++) {
    for (let j = i; j > lo && arr[j - 1] > arr[j]; j--) {
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
      moved++;
    }
    if (moved > 8) return false; // 너무 많이 옮겨야 하면 포기
  }
  return true;
}

function sort3(arr, a, b, c) {
  if (arr[b] < arr[a]) [arr[a], arr[b]] = [arr[b], arr[a]];
  if (arr[c] < arr[b]) [arr[b], arr[c]] = [arr[c], arr[b]];
  if (arr[b] < arr[a]) [arr[a], arr[b]] = [arr[b], arr[a]];
}

function choosePivot(arr, lo, hi) {
  const size = hi - lo, half = Math.floor(size / 2);
  if (size > 128) {
    sort3(arr, lo, lo + half, hi - 1);
    sort3(arr, lo + 1, lo + half - 1, hi - 2);
    sort3(arr, lo + 2, lo + half + 1, hi - 3);
    sort3(arr, lo + half - 1, lo + half, lo + half + 1);
    [arr[lo], arr[lo + half]] = [arr[lo + half], arr[lo]];
  } else {
    sort3(arr, lo + half, lo, hi - 1); // 중앙값이 lo로
  }
}

function breakPatterns(arr, lo, hi) {
  const size = hi - lo;
  if (size < 24) return;
  const q = Math.floor(size / 4);
  [arr[lo], arr[lo + q]] = [arr[lo + q], arr[lo]];
  [arr[hi - 1], arr[hi - q]] = [arr[hi - q], arr[hi - 1]];
}

function insertionSort(arr, lo, hi) {
  for (let i = lo + 1; i < hi; i++) {
    for (let j = i; j > lo && arr[j - 1] > arr[j]; j--) {
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
    }
  }
}

function heapSort(arr, lo, hi) {
  const n = hi - lo;
  const sift = (i, size) => {
    for (;;) {
      let m = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < size && arr[lo + l] > arr[lo + m]) m = l;
      if (r < size && arr[lo + r] > arr[lo + m]) m = r;
      if (m === i) return;
      [arr[lo + i], arr[lo + m]] = [arr[lo + m], arr[lo + i]];
      i = m;
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) sift(i, n);
  for (let end = n - 1; end > 0; end--) {
    [arr[lo], arr[lo + end]] = [arr[lo + end], arr[lo]];
    sift(0, end);
  }
}`,
  patience: `function patienceSort(arr) {
  // 1) 카드를 한 장씩 "맨 위 카드가 자기 이상인" 가장 왼쪽 더미에 올린다
  //    (맨 위 카드들은 왼쪽부터 오름차순 → 이진 탐색)
  const piles = [];
  for (const x of arr) {
    let lo = 0, hi = piles.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (piles[mid][piles[mid].length - 1] >= x) hi = mid;
      else lo = mid + 1;
    }
    if (lo === piles.length) piles.push([]);
    piles[lo].push(x);
  }
  // 2) 각 더미는 위에서부터 꺼내면 오름차순 → 더미들을 병합
  let runs = piles.map((pile) => pile.reverse());
  while (runs.length > 1) {
    const merged = [];
    for (let k = 0; k < runs.length; k += 2) {
      merged.push(k + 1 < runs.length ? merge(runs[k], runs[k + 1]) : runs[k]);
    }
    runs = merged;
  }
  return runs[0] ?? [];
}

function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return out.concat(a.slice(i), b.slice(j));
}`,
  strand: `function strandSort(arr) {
  let rest = [...arr];
  let sorted = [];
  while (rest.length > 0) {
    // 남은 원소에서 증가하는 가닥(strand)을 뽑아낸다
    const strand = [rest[0]];
    const left = [];
    for (let i = 1; i < rest.length; i++) {
      if (rest[i] >= strand[strand.length - 1]) strand.push(rest[i]);
      else left.push(rest[i]);
    }
    rest = left;
    // 정렬된 결과와 가닥을 병합
    sorted = merge(sorted, strand);
  }
  return sorted;
}

function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return out.concat(a.slice(i), b.slice(j));
}`,
  tournament: `function tournamentSort(arr) {
  const n = arr.length;
  let size = 1;
  while (size < n) size *= 2;
  // 완전 이진 트리: 잎에 선수(인덱스), 내부 노드에 경기 승자(더 작은 값)
  const NONE = -1;
  const tree = new Array(2 * size).fill(NONE);
  for (let i = 0; i < n; i++) tree[size + i] = i;
  const play = (a, b) => {
    if (a === NONE) return b;
    if (b === NONE) return a;
    return arr[b] < arr[a] ? b : a; // 같으면 왼쪽 승 → 안정 정렬
  };
  for (let k = size - 1; k >= 1; k--) tree[k] = play(tree[2 * k], tree[2 * k + 1]);

  const result = [];
  for (let round = 0; round < n; round++) {
    const winner = tree[1]; // 우승자 = 남은 것 중 최솟값
    result.push(arr[winner]);
    // 우승자를 빼고, 그 잎에서 루트까지의 경로만 다시 경기
    let k = size + winner;
    tree[k] = NONE;
    for (k >>= 1; k >= 1; k >>= 1) tree[k] = play(tree[2 * k], tree[2 * k + 1]);
  }
  return result;
}`,
  pairwise: `// Parberry의 페어와이즈 정렬 네트워크
// n이 2의 거듭제곱이 아니면, 뒤를 +∞로 채운 것처럼 범위 밖 비교를 건너뛴다
function pairwiseSort(arr) {
  const n = arr.length;
  let size = 1;
  while (size < n) size *= 2;
  const cmpSwap = (i, j) => {
    if (j < n && arr[i] > arr[j]) [arr[i], arr[j]] = [arr[j], arr[i]];
  };

  // 1단계: 쌍 → 쌍의 쌍 → ... (각 블록의 앞 절반 ≤ 뒤 절반)
  let a = 1;
  for (; a < size; a *= 2) {
    for (let b = a, c = 0; b < size; ) {
      cmpSwap(b - a, b);
      b++;
      c = (c + 1) % a;
      if (c === 0) b += a;
    }
  }
  // 2단계: 간격을 줄여 가며 남은 어긋남을 바로잡는다
  a = Math.floor(a / 4);
  for (let e = 1; a > 0; a = Math.floor(a / 2), e = e * 2 + 1) {
    for (let d = e; d > 0; d = Math.floor(d / 2)) {
      for (let b = (d + 1) * a, c = 0; b < size; ) {
        cmpSwap(b - d * a, b);
        b++;
        c = (c + 1) % a;
        if (c === 0) b += a;
      }
    }
  }
  return arr;
}`,
  permutation: `function isSorted(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

// 가능한 모든 순서를 하나씩 만들어 정렬됐는지 확인 (결정적인 보고 정렬)
function permutationSort(arr) {
  if (isSorted(arr)) return arr;
  // Heap 알고리즘: 교환 한 번마다 새로운 순열이 만들어진다
  const n = arr.length;
  const c = new Array(n).fill(0);
  let i = 1;
  while (i < n) {
    if (c[i] < i) {
      const j = i % 2 === 0 ? 0 : c[i];
      [arr[j], arr[i]] = [arr[i], arr[j]];
      if (isSorted(arr)) return arr;
      c[i]++;
      i = 1;
    } else {
      c[i] = 0;
      i++;
    }
  }
  return arr;
}`,
  quantumBogo: `function quantumBogoSort(arr) {
  // 양자 난수로 한 번 섞는다
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // 다세계 해석: 가능한 모든 섞임이 각자의 우주에서 일어났다.
  // 정렬되지 않은 우주는 파괴한다. 살아남은 우주의 배열은 정렬돼 있다.
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) destroyUniverse();
  }
  return arr;
}

function destroyUniverse() {
  throw new Error("💥 이 우주는 정렬에 실패했습니다");
}`,
  bogobogo: `// David Morgan-Mar의 보고보고 정렬
function bogobogoSort(list) {
  if (list.length <= 1) return list;
  for (;;) {
    // 1) 원본을 복사한다
    const copy = [...list];
    // 2~3) 복사본의 앞 n-1개를 보고보고 정렬하고,
    //      마지막 원소가 그 최댓값 이상일 때까지 복사본을 섞으며 반복
    for (;;) {
      const head = bogobogoSort(copy.slice(0, -1));
      copy.splice(0, head.length, ...head);
      if (copy[copy.length - 2] <= copy[copy.length - 1]) break;
      shuffle(copy);
    }
    // 4) 정렬된 복사본이 원본과 순서가 같으면 원본은 정렬돼 있었다
    if (copy.every((x, i) => x === list[i])) return list;
    // 아니면 원본을 섞고 처음부터 다시
    shuffle(list);
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}`,
};
