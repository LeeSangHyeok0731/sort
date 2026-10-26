#!/usr/bin/env sh
# 개편 전(35db39f) 버블·퀵·병합 구현을 bench/old/로 꺼낸다.
# 저장소 루트에서 실행: sh docs/overhaul-review/bench/setup-old.sh
set -e
OUT=docs/overhaul-review/bench/old
mkdir -p "$OUT"
for f in types/sort algorithms/bubbleSort algorithms/quickSort algorithms/mergeSort; do
  git show "35db39f:src/$f.ts" | sed 's#"@/types/sort"#"./sort"#' > "$OUT/$(basename "$f").ts"
done
echo "꺼낸 파일: $(ls "$OUT" | tr '\n' ' ')"
