# 밝은 테마(C1) 디자인 개편

## 목표

어두운 남색 + 보라·분홍 그라데이션 + 반투명 유리 카드 디자인을, 흰 바탕과 얇은 테두리 위주의 깔끔한 밝은 테마 하나로 바꾼다.
레이아웃·크기·동작은 바꾸지 않고 색·테두리·그림자·모서리 같은 표면만 바꾼다.

- 다크 모드는 남기지 않는다 (테마 하나).
- 모바일 점검은 하지 않는다.

## 방식: 의미 토큰

색을 파일마다 직접 쓰지 않고 의미 이름으로 한곳에 모은다.

- `src/app/globals.css`의 `@theme`에 의미 토큰을 정의해 Tailwind 클래스(`bg-surface`, `text-muted`, `border-line` 등)로 쓴다.
- canvas는 CSS 클래스를 쓸 수 없으므로 같은 값을 `src/shared/config/palette.ts`에 두고 가져다 쓴다. 두 곳의 값은 같아야 한다.
- 기존 `text-white/40`, `bg-black/20`, `from-indigo-…` 같은 클래스는 모두 토큰으로 바꾼다.

## 색

| 토큰 | 값 | 용도 |
|---|---|---|
| `background` | `#ffffff` | 페이지 바탕 |
| `surface` | `#ffffff` | 카드·재생 바 |
| `subtle` | `#f9fafb` | 카드 안 옅은 칸 (복잡도 칸, 통계 줄, 비활성 토글 바탕) |
| `line` | `#e5e7eb` | 테두리·구분선 |
| `line-strong` | `#cbd5e1` | 트리 간선·칸 바닥선 (canvas) |
| `foreground` | `#111827` | 본문 글자, 주요 버튼 바탕 |
| `muted` | `#6b7280` | 보조 글자 |
| `faint` | `#9ca3af` | 줄 번호·placeholder·로딩 문구 같은 장식용 글자 |
| `tone-idle` | `#94a3b8` | 막대 기본 |
| `tone-compare` | `#f59e0b` | 비교 |
| `tone-change` | `#ef4444` | 교환·이동 |
| `tone-read` | `#0ea5e9` | 읽기 |
| `tone-done` | `#10b981` | 완료 |
| `slot-1` | `#2563eb` | 비교 모드 첫 번째 알고리즘 |
| `slot-2` | `#7c3aed` | 비교 모드 두 번째 알고리즘 |

배지·안내 문구는 Tailwind 기본 색의 옅은 단계를 쓴다 (안정 정렬 배지 `emerald-50`/`emerald-700`, 주의 문구 `amber-50`/`amber-800`/`amber-200`).

## 화면 요소

- **제목**: 그라데이션 글자 → `foreground` 단색.
- **카드·재생 바·시각화 패널**: 반투명 바탕·`backdrop-blur`·`shadow-2xl`·`rounded-3xl` → `surface` 바탕 + `line` 1px 테두리 + `rounded-lg`. 재생 바의 sticky 동작은 유지.
- **막대 (DOM·canvas)**: 그라데이션·빛번짐 그림자 제거, 상태별 단색. DOM 막대 위 값 글자는 `muted`.
- **버튼**: 주요 버튼(재생 등)은 `foreground` 바탕 + 흰 글자. 보조 버튼은 `line` 테두리 + `muted` 글자, 마우스를 올리면 `subtle` 바탕 + `foreground` 글자.
- **선택 상태 (토글·탭·목록)**: 선택 = `foreground` 바탕 + 흰 글자, 미선택 = `muted` 글자.
- **입력칸·검색 목록**: `surface` 바탕 + `line` 테두리, 포커스 시 `foreground` 테두리.
- **진행 바(scrubber)**: 트랙 `line`, 채움 `foreground`, 손잡이 흰색 + `foreground` 테두리.
- **슬롯 표시 (비교 모드)**: 남색·분홍 → `slot-1`·`slot-2`. 정보 카드 제목 색도 같다.

## canvas와 코드 패널

- `CanvasBars`·`TreeCanvas`·`BinsCanvas`는 `palette.ts`의 값을 쓴다. 노드·카드는 `tone` 단색으로 채우고 값 글자는 `foreground`, 고스트(점선)는 `tone` 색 테두리, 간선·칸 바닥선은 `line-strong`, 활성 칸 바닥선은 `tone-compare`·라벨은 `foreground`, 비활성 라벨은 `faint`.
- 코드 패널은 `prismjs/themes/prism-tomorrow.css`를 빼고 `globals.css`에 밝은 문법 색을 직접 정의한다 (`.token.keyword` 등, 바탕 투명·글자 그림자 없음).
- 현재 줄 강조와 줄별 실행 횟수 색도 밝은 바탕에 맞춘다.

## 범위 밖

- 배치·크기·애니메이션·기능 변경.
- 다크 모드, 모바일 대응.

## 확인

- `npm run lint`, `npm run typecheck`, `npm test` 통과.
- 브라우저에서 직접 확인:
  - 단일 모드와 비교 모드
  - 100개 이하(DOM 막대)와 100개 초과(canvas 막대)
  - 트리 보기(힙)와 칸 보기(버킷)
  - 코드 패널 줄 하이라이트
  - 알고리즘 검색 목록, 사용자 배열 입력
  - 주의 문구가 있는 알고리즘 (예: 보고 정렬)
- `src`에 `text-white`, `bg-black`, `indigo`, `pink` 같은 어두운 테마용 클래스가 남지 않았는지 검색.
