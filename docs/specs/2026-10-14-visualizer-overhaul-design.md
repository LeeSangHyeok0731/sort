# Sorting Visualizer 개선 설계

## 목표
1. 버그 수정: 하이라이트 1스텝 어긋남, 입력 검증, URL size 덮어쓰기, 보고 정렬 한도 안내
2. 성능: 스냅샷 대신 연산 로그 → 1000개에서도 메모리 안정, 고배속 다중 연산/프레임
3. 레지스트리 단일화 + 알고리즘별 테스트(vitest)
4. 비교 모드/지표: 비교·교환·이동 횟수, 진행률, 승자 표시, 시작 전 2번 패널 표시
5. UI/UX: 단일 재생바(재생/일시정지/한 단계 앞뒤/스크럽), 색상 범례, 완료 효과, 알고리즘 정보 카드(복잡도·안정성), 데이터 프리셋, 키보드 단축키
6. FSD 파일 구조

## 연산 로그 모델
- `Op = compare(i,j) | swap(i,j) | move(from,to) | mark(i)`
  - `move`: from 위치 요소를 꺼내 to에 삽입(사이 요소는 한 칸씩 밀림). 병합/계수/기수/버킷/팀/트리 정렬의 "쓰기"를 id 중복 없이 표현하고 안정성을 지킨다.
  - `mark`: 값 읽기(계수·기수 카운팅 단계) 하이라이트. 비교로 집계하지 않음.
- 저장: 평탄화된 `number[]` (`[type, a, b, ...]`).
- 모든 연산은 역연산 존재(swap 자기역, move(from,to)⁻¹ = move(to,from), compare/mark는 무변화) → 뒤로 가기·스크럽.
- 알고리즘은 `Tracer`(작업 배열 + 기록) API만 사용: `t.cmp(i,j)`, `t.swap`, `t.move`, `t.mark`, `t.value(i)`, `t.length`.
- 보고 정렬은 시도 한도 도달 시 `meta.truncated = true` 반환.

## 재생 (features/playback)
- 순수 코어 `createTrack(initial, ops)` + `seek(track, cursor)` / `step(+1|-1)`.
- `useSortPlayer` 훅: 트랙 1~2개, rAF 누적기로 `opsPerSec = 10 × speed` 만큼 처리. 배속 0.25x~1024x.
- 하이라이트 = 커서 직전에 적용된 연산.
- 지표: 커서까지의 비교/교환/이동 누적치(적용·역적용 시 증감).

## FSD 구조
Next의 `app/`, `pages/` 예약 폴더 충돌을 피하기 위해 FSD pages 레이어는 `views`로 명명.
```
src/app/                Next 라우팅 + 전역 스타일 (FSD app 레이어)
src/views/home/         페이지 조립 + URL 상태
src/widgets/visualizer/ 막대 패널, 재생바, 지표, 코드 뷰어 조립
src/features/playback/  재생 엔진 + 재생 컨트롤 UI
src/features/select-algorithm/  알고리즘 선택(비교 모드 포함), 파라미터
src/features/configure-array/   커스텀 입력·프리셋 생성
src/entities/sort-algorithm/    Op/Tracer, 20개 알고리즘(+테스트), 레지스트리
src/entities/array/             ArrayItem, 생성/파싱/검증(+테스트), ArrayBars UI
src/shared/                     공용 lib(cn 등), config
```
각 슬라이스는 `index.ts` 공개 API만 노출, 상위 → 하위 레이어 단방향 의존.

## 입력 검증
- 값: 0~9999 정수, 개수 2~1000. 위반 시 입력창 아래 오류 메시지.
- URL은 마운트 시 1회 읽기, 이후 쓰기만(`history.replaceState`) → 커스텀 배열 덮어쓰기 제거.

## 테스트
- 알고리즘별 `*.test.ts`: 공용 스위트(빈/1개/정렬됨/역순/중복/랜덤 다수 → 정렬 결과, id 집합 보존, 연산 재생 결과 = 최종 배열) + 레지스트리의 `stable` 주장 검증 + 알고리즘별 특이 케이스.
- 재생 코어: 앞으로/뒤로 seek 왕복 시 초기 배열 복원.
- 배열 생성/파싱 검증.
