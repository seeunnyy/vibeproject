## Why

`planning/md-design/` 설계는 완성됐지만 실행 가능한 명세(코드 계약)가 없다. 1차 MVP의 핵심 흐름 — 공동소유 자산을 **생성하고, 목록에서 확인하고, 상태를 바꾸고, 필터링**하는 부분 — 을 먼저 명세로 확정해 구현 착수 지점을 만든다. 비용 기록·종료 규칙·정산·요약은 이 change 범위 밖이며 이후 change로 다룬다.

## What Changes

- **자산 생성**: 물건명, 구매일(선택), 총 구매금액, 참여자(≥2), 관리자(선택), 분배 방식(납부액/균등), 납부액을 입력해 자산 1건을 만든다. 생성 시 상태는 `draft`.
- **자산 목록**: 등록된 자산을 카드 목록으로 보여준다. 각 카드에 물건명·참여자 수·총액·**상태 배지**·관리자 표시.
- **자산 상태**: `draft`(작성중) → `agreed`(합의완료) → `settled`(정산완료) 3단계. 사용자가 상세 화면에서 전환한다. **BREAKING 아님 — 신규 필드.**
- **목록 필터**: 상태 칩(전체/작성중/합의완료/정산완료) + 참여자 선택 + 물건명 검색어로 목록을 거른다.
- **로컬 저장/복원**: 위 데이터는 브라우저 `localStorage` 단일 키에 저장하고 새로고침 후 복원한다. 손상 시 빈 상태로 복구한다.
- **설계 문서 확장**: `Asset.status` 필드는 `04_TECHNICAL_DESIGN` 데이터 모델에 없던 것이고, 목록 필터·검색은 `01_PRODUCT_BRIEF §5.3`에서 "다음 버전 후보"였다. 이 change로 1차 MVP 범위에 편입한다.

## Capabilities

### New Capabilities
- `asset-registration`: 자산 생성 입력·검증(필수 항목, 납부액 합계 = 총 구매금액)·저장. 생성 결과 상태는 `draft`.
- `asset-status`: 자산 라이프사이클 상태값(`draft`/`agreed`/`settled`)과 전환 규칙, 목록·상세의 상태 표시.
- `asset-list`: 자산 목록 조회와 필터(상태·참여자·물건명 검색), 빈 상태 표현.
- `local-persistence`: `localStorage` 단일 키 저장·복원, 손상 데이터 복구.

### Modified Capabilities
- 없음 (`openspec/specs/` 에 기존 명세 없음).

## Impact

- **신규 코드**: `src/lib/types.ts`(`Asset` + `status` 필드), `src/lib/storage/`(어댑터·스키마), `src/lib/state/`(Context+reducer), `src/app/app/`(목록·생성·상세 route). 근거: `04_TECHNICAL_DESIGN §2·§3·§4`.
- **범위 밖**: 비용 기록(S4), 종료 규칙(S5), 정산(S6), 공유 요약(S7), 계산 모듈(`shares`/`costs`/`settlement`).
- **의존성**: 추가 없음. 외부 API·결제·인증 없음 (`CLAUDE.md` 경계 유지).
- **문서 후속**: 이 change 확정 후 `04_TECHNICAL_DESIGN` 데이터 모델과 `01/05` 범위 표에 `status`·필터를 반영해야 함(별도 문서 작업).
