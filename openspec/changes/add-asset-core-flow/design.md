## Context

`planning/md-design/04_TECHNICAL_DESIGN.md` 가 스택·route·상태·저장 구조를 이미 정한다(Next.js App Router, React, TypeScript, Tailwind, `localStorage` 단독, 외부 API 없음). `src/` 코드는 아직 없다. 이 문서는 그 구조를 **자산 핵심 흐름(생성·목록·상태·필터)** 슬라이스에 적용하고, specs가 새로 들인 두 가지(`Asset.status`, 목록 필터)를 어떻게 얹는지만 다룬다. 동기는 `proposal.md - Why` 참조, 요구사항은 `specs/` 참조.

## Goals / Non-Goals

**Goals:**
- `04 §4` 데이터 모델에 `status` 필드 1개만 추가하고 나머지 `Asset` 형태는 그대로 유지
- 상태 전환 규칙을 순수 함수 1개로 모아 테스트 가능하게
- 목록 필터·검색을 저장하지 않는 파생 계산으로 처리
- 생성·삭제·상태 변경이 `04 §6` 단일 키 저장소에 즉시 반영

**Non-Goals:**
- `computeSaleSettlement`, `sumCostsByPayer` 등 정산·비용 계산 모듈 (별도 change)
- 비용 기록(S4)·종료 규칙(S5)·정산(S6)·요약(S7) 화면과 route
- 생성 후 물건명·총액·참여자 편집 (이 슬라이스는 상태 변경·삭제만)
- 필터 상태를 URL·저장소에 보존

## Decisions

### D1. `status` 는 저장되는 enum
`Asset.status: 'draft' | 'agreed' | 'settled'` 를 저장 필드로 둔다.
- 대안: 입력값에서 파생(`f(asset)`). 기각 — specs가 사용자 주도 전환과 역방향 되돌리기를 요구하는데, 파생값은 "사용자가 정산완료로 표시함"을 표현할 수 없다.
- `StoreSchema` 는 `version: 1` 유지. 신규 필드이므로 기존 데이터 마이그레이션 불필요(이 프로젝트는 아직 저장된 데이터가 없다).

### D2. 전환 규칙은 순수 함수
`canTransition(asset, to): boolean` 하나에 규칙을 모은다(`asset-status` spec 의 전진/후진 규칙). UI는 이 함수 결과로 버튼 활성/비활성만 결정한다.
- `draft → agreed` 는 `checkContribution(asset).ok` (균등 모드는 항상 true) 일 때만.
- 나머지 인접 전환은 자유. `agreed → draft` 는 UI에서 확인 절차.
- 대안: 화면마다 조건 분기. 기각 — 규칙이 흩어져 테스트 불가.

### D3. 필터·검색은 파생 계산
`filterAssets(assets, { status, memberName, query }): Asset[]` 로 메모리 배열을 거른다. 저장하지 않는다.
- `status`: 정확히 일치 또는 "전체"
- `memberName`: `members` 에 해당 이름 존재
- `query`: `name` 부분 일치, `trim().toLowerCase()` 비교
- 세 조건 AND. 결과 0건과 "자산 0건"을 호출부에서 구분.

### D4. 상태 계층은 `04 §5` 재사용, 액션 3개만
Context + `useReducer` + 단일 키 즉시 저장. 이 슬라이스가 쓰는 액션: `createAsset`, `deleteAsset`, `setStatus`. `04 §5` 의 나머지 액션(`addCost`, `setSalePrice` 등)은 이 change에서 구현하지 않는다.

### D5. 지분 계산은 이 change에 포함
`asset-registration` spec 의 "지분율 자동 산출"·"납부액 합계 검증" 때문에 `04 §7` 의 `computeShares`, `checkContribution` 두 순수 함수가 이 change 범위에 들어온다. (`05_DELIVERY_PLAN` 은 이를 W1 뒤로 미뤄 뒀으므로 문서 후속 수정 대상 — `proposal.md - Impact` 참조.)

### D6. route 3개, SSR 회피
`/app`(목록+필터), `/app/assets/new`(생성), `/app/assets/[id]`(상세+상태 전환)만 만든다. `/app/**` 뷰는 `next/dynamic` 의 `{ ssr: false }` 로 감싸고 Provider에 `mounted` 가드를 둬 서버 렌더에서 `localStorage` 접근을 피한다.

## Risks / Trade-offs

- 사용자가 상태를 임의 전환 → 검증 안 맞는데 `agreed` 가능 → **완화**: `draft → agreed` 에만 납부액 검증 게이트. 그 밖의 전환은 사람 판단에 맡김.
- `settled` 상태가 이 change엔 정산 화면이 없어 의미가 얕음 → **완화**: 수용. 다음 정산 change에서 `settled` 진입을 매각가 입력과 연결.
- 필터를 URL에 안 넣어 새로고침 시 필터가 초기화됨 → **완화**: 수용(경미). 자산 데이터 자체는 유지.
- 동명이인 참여자를 참여자 필터가 함께 잡음 → **완화**: 이 슬라이스는 이름 기준 유지. id 기준 필터는 참여자 편집 기능과 함께 후속 change.
- 지분 계산이 이 change로 앞당겨져 `05` 일정과 어긋남 → **완화**: proposal에 명시, `05` 범위·일정 표를 후속으로 갱신.

## Migration Plan

그린필드. 배포 이력 없음. 롤백 = 이 change가 추가한 `src/` 파일 삭제, `localStorage` 키 제거.

## Open Questions

- 필터 상태를 URL 쿼리에 보존할지 — 후속 개선. specs·접근·tasks 불변.
- 목록 정렬 기준 — `createdAt` 내림차순으로 가정. 확정은 나중에.
