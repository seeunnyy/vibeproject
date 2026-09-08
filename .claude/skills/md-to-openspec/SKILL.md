---
name: md-to-openspec
description: >-
  planning/md-design/ 설계 문서 5종(01~05)을 읽어 OpenSpec 변경 제안 1건
  (openspec/changes/<id>/ 의 proposal.md · tasks.md · design.md · specs/<capability>/spec.md)
  으로 변환한다. 파일을 바로 만들지 않고 생성할 트리와 내용 요약을 먼저 보여준 뒤
  사용자 승인을 받아 생성한다. 사용자가 /md-to-openspec 로 직접 호출할 때만 실행.
---

# md-to-openspec

`planning/md-design/` 의 설계 문서를 **OpenSpec 변경 제안 1건**으로 옮긴다.

## 1. 실행 조건

- 사용자가 `/md-to-openspec [change-id]` 로 **직접 호출**할 때만 실행. 자동 트리거 없음.
- `change-id` 인자가 없으면 기본값 `add-woorimok-mvp` 를 쓴다.
- `planning/md-design/` 문서는 **읽기 전용 소스**다. 절대 수정하지 않는다.
- 새로 만드는 파일은 전부 `openspec/` 아래에만 둔다.

## 2. 절차 (반드시 이 순서)

1. `planning/md-design/` 의 `01`~`05` 5개 파일을 모두 읽는다. 하나라도 없으면 그 사실을 보고하고 멈춘다.
2. `openspec/changes/<change-id>/` 가 이미 있으면 **덮어쓰지 말고 중단**, 사용자에게 알린다.
3. §4 매핑에 따라 변경 제안 내용을 **메모리에서** 구성한다. (아직 파일 쓰지 않음)
4. §3 형식으로 **미리보기**를 출력한다: 생성할 파일 트리 + 파일별 3~6줄 요약.
5. 사용자 승인을 기다린다. 승인 전에는 어떤 파일도 쓰지 않는다.
6. 승인되면 트리대로 파일을 생성하고, 생성된 경로 목록을 출력한다.

## 3. 미리보기 형식

```
## 변환 대상: openspec/changes/<change-id>/

openspec/
  changes/
    <change-id>/
      proposal.md              — <요약>
      tasks.md                 — <요약>
      design.md                — <요약>
      specs/
        <capability-a>/spec.md — <요약>
        <capability-b>/spec.md — <요약>

## 도출한 capability 목록
- <capability-a>: <02 FR 중 어떤 것들을 묶었는지>
- ...

## 확인 필요
- <소스 문서 간 충돌이나 빈칸 때문에 임의 판단한 지점>

승인하면 위 파일을 생성합니다.
```

- 미해결 질문(`02 §7`)이나 문서 충돌이 있으면 그대로 `## 확인 필요`에 적는다. **스스로 메꾸지 않는다.**

## 4. 소스 → 산출물 매핑

| 소스 | 산출물 | 방법 |
|---|---|---|
| `01_PRODUCT_BRIEF` | `proposal.md` › `## Why` | 문제·가치·범위를 3~6줄로 압축 |
| `05_DELIVERY_PLAN` | `proposal.md` › `## What Changes`, `## Impact` | 오늘 슬라이스·MVP 포함 항목 → 변경 요약. Non-goals → Impact 밖 |
| `05_DELIVERY_PLAN` | `tasks.md` | 작업 단위·주차를 체크박스 목록으로 (`## 1. <그룹>` + `- [ ] 1.1 ...`) |
| `04_TECHNICAL_DESIGN` | `design.md` | route / 타입 / 상태 / 저장 / 계산 시그니처를 결정 기록으로 |
| `02_REQUIREMENTS_SPEC` | `specs/<capability>/spec.md` › `## ADDED Requirements` | FR → `### Requirement:`, R(규칙) → 해당 Requirement 안의 SHALL 문장 |
| `02` AC + `03` 화면·상호작용 | 같은 spec 파일의 `#### Scenario:` | AC 1건 = Scenario 1개. 화면 흐름에서 빠진 시나리오 보완 |
| `02 §6 추적표` | capability 분해 근거 | FR 묶음의 기준으로 사용 |

## 5. capability 도출

- `02` 의 FR을 기능 영역으로 묶어 capability 이름(kebab-case)을 만든다. 예: `asset-registration`, `share-calculation`, `contribution-check`, `cost-log`, `termination-sale`, `settlement-sale`, `shared-summary`, `local-persistence`.
- 한 capability = `specs/<capability>/spec.md` 1개. 그 안에 관련 FR들이 `### Requirement:` 로 들어간다.
- 묶음이 애매하면 미리보기 `## 확인 필요`에 적고 사용자 판단을 받는다.

## 6. OpenSpec 포맷 규칙

**proposal.md**
```
## Why
<01 + 05 요약>

## What Changes
- <MVP 범위 항목들>

## Impact
- Affected specs: <capability 목록>
- 코드 없음(설계 단계). Non-goals: <01 §5.2>
```

**tasks.md**
```
## 1. <그룹명>
- [ ] 1.1 <작업>
- [ ] 1.2 <작업>
```

**specs/<capability>/spec.md** (그린필드이므로 전부 ADDED)
```
## ADDED Requirements

### Requirement: <FR 제목>
The system SHALL <FR 내용>. <관련 R 규칙을 SHALL 문장으로>.

#### Scenario: <AC 제목>
- WHEN <상황>
- THEN <기대 결과>
- AND <추가 기대>
```

- 모든 `### Requirement:` 는 최소 1개의 `#### Scenario:` 를 가진다. AC가 없는 FR은 `03` 화면 명세에서 시나리오를 유도하고, 그것도 없으면 `## 확인 필요`에 적는다.
- SHALL 문장은 문서에 있는 내용만 쓴다. 값·규칙을 새로 만들지 않는다.

## 7. 하지 말 것

- `planning/md-design/` 문서·코드·설정 등 `openspec/` 밖의 파일을 만들거나 수정하지 않는다.
- 미리보기·승인 단계를 건너뛰고 파일을 쓰지 않는다.
- 문서에 없는 요구사항·시나리오·규칙을 지어내지 않는다. 빈칸은 `## 확인 필요`로 넘긴다.
- 기존 `openspec/changes/<change-id>/` 를 덮어쓰지 않는다.
- OpenSpec 구현(코드)을 시작하지 않는다. 이 Skill은 문서 변환까지만.
