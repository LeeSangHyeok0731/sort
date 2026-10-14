import { AlgorithmId } from "@/components/ControlPanel";

export const ALGO_CODE: Record<AlgorithmId, string> = {
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
};
