# Sorting Visualizer

정렬 알고리즘 32종(기본·비교 없는·특이한·재미있는 정렬)을 막대 애니메이션으로 보여주는 웹앱입니다. 두 알고리즘을 같은 배열로 나란히 비교할 수 있습니다.

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest
npm run lint
npm run typecheck
npm run build
```

PR을 올리거나 `main`에 push하면 GitHub Actions(`.github/workflows/ci.yml`)가 lint·타입 체크·테스트를 자동으로 실행합니다.

## 주요 기능

- **재생 제어**: 재생/일시정지, 한 단계 앞·뒤, 진행바 드래그, 속도 ×0.25 ~ ×1024
- **비교 모드**: 두 알고리즘의 비교·교환·이동 횟수 비교, 먼저 끝난 쪽 표시
- **데이터**: 크기 2~1000, 프리셋(무작위 순열/중복 있음/거의 정렬됨/역순/중복 많음), 직접 입력(0~9999)
- **학습용 정보**: 시간·공간 복잡도, 안정성, 설명용 구현 코드
- **공유**: 현재 설정(알고리즘, 속도, 크기, 커스텀 배열 등)이 URL에 반영됨
- **단축키**: `Space` 재생/일시정지 · `←` `→` 한 단계 · `R` 새 배열

## 구조 (Feature-Sliced Design)

```
src/
├─ app/                     Next.js 라우팅 + 전역 스타일 (FSD app 레이어)
├─ views/home/              페이지 조립, URL 상태, 단축키 (FSD pages 레이어 — Next의 pages/와 충돌하지 않게 views로 명명)
├─ widgets/visualizer/      막대 패널 + 지표 + 범례
├─ features/
│  ├─ playback/             재생 엔진(Track, useSortPlayer) + 재생바 UI
│  ├─ select-algorithm/     알고리즘 선택, 셸/버킷 옵션
│  └─ configure-array/      크기·프리셋·직접 입력
├─ entities/
│  ├─ sort-algorithm/       Op 로그, Tracer(연산 한도 300만), 알고리즘 32종(+테스트), 레지스트리, 정보 카드, 코드 뷰어
│  └─ array/                배열 생성·파싱·검증, 막대 UI(DOM / canvas)
└─ shared/                  공용 타입, 유틸, UI
```

각 슬라이스는 `index.ts`로만 외부에 공개하고, 의존은 위 레이어 → 아래 레이어 한 방향으로만 흐릅니다.

## 동작 방식

알고리즘은 배열을 직접 다루지 않고 `Tracer`를 통해 `cmp(i, j)`, `swap(i, j)`, `move(from, to)`, `mark(i)`를 호출합니다. 호출은 `[type, a, b, …]` 형태의 연산 로그로 기록되고, 재생 엔진이 이 로그를 앞뒤로 적용합니다. 모든 연산에는 역연산이 있어서 되감기와 진행바 드래그가 가능합니다. 배열 스냅샷을 저장하지 않으므로 1000개 배열도 메모리 부담이 작습니다.

### 알고리즘 추가하기

1. `src/entities/sort-algorithm/algorithms/xxxSort.ts`에 `SortAlgorithm` 객체를 작성합니다. 설명용 코드는 `algorithms/code.ts`에 넣습니다.
2. `model/registry.ts`의 `ALGORITHMS`에 추가합니다.
3. `xxxSort.test.ts`에서 `describeSortAlgorithm(xxxSort)`를 호출합니다. 정렬 결과, id 보존, 연산 재생 일치를 확인하고, `stable: true`이면 안정성도 확인합니다.

개발 과정의 문제와 해결 기록은 [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)에 있습니다.
