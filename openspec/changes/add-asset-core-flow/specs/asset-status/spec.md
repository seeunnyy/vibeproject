## Purpose

자산의 라이프사이클 상태(`draft` → `agreed` → `settled`)와 사용자가 이를 전환할 수 있는 조건, 목록·상세에서의 상태 표시를 정의한다.

## ADDED Requirements

### Requirement: 상태값
The system SHALL 모든 자산에 정확히 하나의 상태를 부여한다: `draft`(작성중), `agreed`(합의완료), `settled`(정산완료).

#### Scenario: 상태 배지 표시
- **WHEN** 사용자가 자산 목록 또는 상세를 연다
- **THEN** 각 자산에 현재 상태가 배지로 표시된다 (작성중 / 합의완료 / 정산완료)

### Requirement: 전진 전환 규칙
The system SHALL 사용자가 상세 화면에서 상태를 한 단계씩만 전진시킬 수 있게 한다: `draft` → `agreed`, `agreed` → `settled`. `draft`에서 `settled`로 건너뛸 수 없다. `draft` → `agreed` 전환은 지분이 확정된 경우에만 허용한다: "납부액" 모드는 납부액 합계 = 총 구매금액일 때, "균등" 모드는 항상.

#### Scenario: 검증 통과 시 합의완료로 전환
- **WHEN** 자산이 `draft`이고 납부액 합계가 총 구매금액과 일치하며 사용자가 "합의완료로 변경"을 실행한다
- **THEN** 상태가 `agreed`로 바뀐다

#### Scenario: 검증 실패 시 합의완료 전환 차단
- **WHEN** 자산이 `draft`이고 "납부액" 모드에서 납부액 합계가 총 구매금액과 다르다
- **THEN** "합의완료로 변경"이 비활성화되고 사유(차액)가 표시된다

#### Scenario: 단계 건너뛰기 불가
- **WHEN** 자산이 `draft` 상태이다
- **THEN** `settled`로 직접 바꾸는 동작은 제공되지 않는다

#### Scenario: 합의완료에서 정산완료로 전환
- **WHEN** 자산이 `agreed`이고 사용자가 "정산완료로 변경"을 실행한다
- **THEN** 상태가 `settled`로 바뀐다

### Requirement: 후진 전환 규칙
The system SHALL 사용자가 상태를 한 단계씩 되돌릴 수 있게 한다: `settled` → `agreed`, `agreed` → `draft`. `agreed` → `draft` 전환은 합의가 무효화된다는 확인을 받은 뒤에만 수행한다.

#### Scenario: 합의완료를 작성중으로 되돌림
- **WHEN** 자산이 `agreed`이고 사용자가 "작성중으로 되돌리기"를 실행한 뒤 확인한다
- **THEN** 상태가 `draft`로 바뀐다

#### Scenario: 정산완료를 합의완료로 되돌림
- **WHEN** 자산이 `settled`이고 사용자가 "합의완료로 되돌리기"를 실행한다
- **THEN** 상태가 `agreed`로 바뀐다

### Requirement: 상태 변경 지속
The system SHALL 상태 변경을 즉시 로컬 저장소에 반영한다.

#### Scenario: 상태 변경 후 새로고침
- **WHEN** 사용자가 자산을 `agreed`로 바꾸고 페이지를 새로고침한다
- **THEN** 그 자산은 여전히 `agreed` 상태이다
