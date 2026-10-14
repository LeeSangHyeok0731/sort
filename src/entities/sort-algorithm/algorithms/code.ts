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
};
