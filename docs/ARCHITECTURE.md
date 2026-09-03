# ARCHITECTURE.md — 우리몫 (가제)

> 관련: [PRD.md](./PRD.md) · [DESIGN.md](./DESIGN.md)
> 이 문서는 데이터 모델·계산식의 **단일 기준(source of truth)** 이다. 계산 로직을 바꾸면 이 문서를 같은 커밋에서 갱신한다.

## 1. 개요

- 클라이언트 전용 모바일 웹. 서버·외부 API 없음.
- 모든 수치는 사용자 입력 + 사칙연산. 금액은 **KRW 정수(원)**.
- 계산은 `lib/calc/`의 순수 함수에 격리하고, UI는 그 결과를 표시만 한다.
- 저장: MVP는 브라우저 `localStorage`. `lib/db` 인터페이스로 감싸 이후 서버 전환 가능.

## 2. 폴더 구조 (예정)

```
vibeproject/
├── app/                              # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                      # (1) 홈 · 자산 목록
│   ├── assets/
│   │   ├── new/page.tsx              # (2) 자산 생성 (4스텝)
│   │   └── [assetId]/
│   │       ├── page.tsx              # (3) 자산 상세 · 지분 확인
│   │       ├── costs/page.tsx        # (4) 공동비용 기록
│   │       ├── termination/page.tsx  # (5) 종료 규칙 합의
│   │       └── settlement/page.tsx   # (6) 정산 시뮬레이션 · 결과
│   └── share/[assetId]/page.tsx      # (7) 공유 요약 (읽기 전용)
├── components/
│   ├── ui/                           # 버튼·입력·시트·배지 등 기본
│   ├── asset/                        # AssetCard, ParticipantRow, ShareBar, PercentGauge
│   ├── cost/                         # CostSheet, BalanceTable
│   └── settlement/                   # ScenarioSegment, SettlementCard, ShareSummary
├── lib/
│   ├── calc/
│   │   ├── allocate.ts               # allocateByShare — 정수 배분
│   │   ├── shares.ts                 # 지분 계산
│   │   ├── balances.ts               # 누적 부담액 / 잔액 계산
│   │   └── settlement.ts             # 매각·인수·폐기 정산 계산
│   ├── db/
│   │   ├── index.ts                  # 저장소 인터페이스
│   │   └── local-storage.ts          # localStorage 구현
│   ├── validation/                   # zod 스키마
│   └── format.ts                     # 통화 / 퍼센트 포맷
├── types/
│   └── domain.ts                     # 도메인 타입
├── docs/
│   ├── PRD.md
│   ├── DESIGN.md
│   ├── ARCHITECTURE.md
│   └── SDD.md                        # (다음 회차)
├── CLAUDE.md
└── (config: package.json, tsconfig.json, tailwind.config.ts …)
```

## 3. 데이터 모델

관계: `Asset` 1—N `Participant`, 1—N `CostEntry`, 1—N `AgreementNote`, 1—1 `TerminationRule`(현재 합의).
`CostEntry.payerId` → `Participant.id`. `Share`·`Balance`·`SettlementResult`는 **저장하지 않는 파생값**이다.

### 3.1 Asset — 자산

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | |
| `name` | string | 물건명 |
| `category` | enum? | 가구 / 가전 / 장비 / 행사물품 / 기타 |
| `purchaseDate` | ISO date | 구매일 |
| `purchaseAmount` | int | 총 구매금액 `P` |
| `shareMode` | `'contribution' \| 'equal'` | 지분 산정 방식 |
| `memo` | string? | |
| `status` | `'active' \| 'closing' \| 'closed'` | 상태 (§6 전이) |
| `createdAt` / `updatedAt` | ISO datetime | |

### 3.2 Participant — 참여자

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | |
| `assetId` | string | |
| `name` | string | |
| `contribution` | int | 납부액 `cᵢ`. `shareMode='equal'`이면 `P`를 균등 배분한 값을 저장 |
| `colorIndex` | int | 참여자 색 순환 인덱스 |
| `createdAt` | ISO datetime | |

### 3.3 Share — 지분 (파생)

`computeShares()` 결과. 저장하지 않는다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `participantId` | string | |
| `ratio` | number | 0..1, Σ = 1 |
| `percentText` | string | 표시용 (예: `33.3%`) |

### 3.4 CostEntry — 공동비용

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | |
| `assetId` | string | |
| `date` | ISO date | |
| `type` | enum | `repair`(수리비) / `extra_purchase`(추가구매비) / `shipping`(배송비) / `other` |
| `amount` | int | 비용 금액 |
| `payerId` | string | 실제 지불한 참여자 |
| `splitMode` | `'by_share' \| 'equal'` | 분담 방식 (기본 `by_share`) |
| `memo` | string? | |
| `createdAt` | ISO datetime | |

### 3.5 AgreementNote — 합의사항

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` / `assetId` | string | |
| `body` | string | 자유 서술 합의 내용 |
| `createdAt` | ISO datetime | |

### 3.6 TerminationRule — 종료 규칙

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` / `assetId` | string | |
| `method` | `'sale' \| 'buyout' \| 'disposal'` | 매각 / 한 명의 인수 / 폐기 |
| `valuationBasis` | string | 평가액 산정 기준 (서술) |
| `buyerId` | string? | `method='buyout'`일 때 인수자 |
| `saleCost` | int? | `method='sale'` 매각 부대비용 (기본 0) |
| `salvageValue` | int? | `method='disposal'` 잔존가치 `R` (기본 0) |
| `disposalCost` | int? | `method='disposal'` 폐기비용 `D` (기본 0) |
| `notes` | string? | |
| `agreedAt` | ISO datetime | |

### 3.7 SettlementResult — 정산 결과 (파생)

| 필드 | 타입 | 설명 |
|---|---|---|
| `method` | enum | 적용한 종료 방식 |
| `currentValue` | int | 사용자 입력 현재 평가액 `V` |
| `lines[]` | 배열 | `{ participantId, ratio, equityValue, balance, payout, formula }` |
| `buyerPayment` | int? | `method='buyout'` 인수자가 지급할 총액 |
| `checksum` | int | `Σ payout` — 배분 대상 재원과 일치해야 함 |

## 4. 계산 로직

### 4.0 공통 — 정수 배분 `allocateByShare(total, ratios[]) -> int[]`

`total`(음수 가능)을 `ratios` 비율로 나누되, 결과 합이 정확히 `total`이 되도록 나머지를 배분한다.

```
raw[i]    = total * ratios[i]
floor[i]  = Math.floor(raw[i])
remainder = total - Σ floor[i]          // 항상 0 이상 ratios.length 미만
// 소수부(raw - floor) 큰 순서로 remainder 개에 +1, 동률이면 입력 순서
```

- `Math.floor`는 음수에도 "값 이하의 정수"라서 `remainder ≥ 0`이 보장된다 → 음수 `total`(폐기 손실 배분)에서도 동작.
- 모든 금액 배분은 이 함수를 거친다. 반올림 오차 누적 금지.

### 4.1 지분 계산 — `computeShares(asset, participants)`

```
shareMode = 'equal'
  → 모든 참여자 ratio = 1 / n
    (표시 납부액 = allocateByShare(P, [1/n, …]))

shareMode = 'contribution'
  → Σc = Σ participant.contribution
    ratio[i] = contribution[i] / Σc
    검증: Σc == P 여야 한다. 불일치 시 화면에 경고(계산은 Σc 기준으로 진행)
```

지분 합계 검증(화면): `Σ ratio == 1` (부동소수 허용오차 1e-9). `PercentGauge`가 부족/정상/초과를 표시.

### 4.2 누적 부담액 / 잔액 — `computeBalances(asset, participants, costs)`

각 참여자 `i`에 대해:

```
paid[i] = contribution[i]
        + Σ (cost.amount where cost.payerId == i)          // 실제로 낸 총액

due[i]  = allocateByShare(P, shares)[i]                     // 구매금액 분담분
        + Σ_over_costs  splitOf(cost)[i]                    // 비용 분담분
          where splitOf(cost) =
            cost.splitMode == 'equal'
              ? allocateByShare(cost.amount, [1/n, …])
              : allocateByShare(cost.amount, shares)

balance[i] = paid[i] - due[i]                               // + : 더 냄(받을 쪽) / - : 덜 냄(낼 쪽)
```

성질: `Σ paid == Σ due == P + Σ cost.amount`, 따라서 **`Σ balance == 0`**.
화면(§4 비용 화면)은 `paid`(누적 부담액)와 `초기 지분`을 구분해 보여주고 `balance`를 방향색으로 표시.

### 4.3 정산 계산 — `settle(asset, participants, costs, rule, currentValue V)`

공통 준비: `shares = computeShares(...)`, `balance = computeBalances(...)`.
각 시나리오의 배분 대상 재원을 `base`라 하면 결과는 항상:

```
equity[i] = allocateByShare(base, shares)[i]
payout[i] = equity[i] + balance[i]          // + 받을 금액 / - 추가 지급액
checksum  = Σ payout[i] == base             // 반드시 성립
```

#### (a) 매각 `method = 'sale'`

```
base = V - (rule.saleCost ?? 0)             // 매각 대금에서 부대비용 차감
payout[i] = allocateByShare(base, shares)[i] + balance[i]
```
매각 대금을 지분대로 나눈 뒤, 비용 잔액으로 조정. 자산 보유자는 없음.

#### (b) 한 명의 인수 `method = 'buyout'`, 인수자 `k = rule.buyerId`

```
equity[i]  = allocateByShare(V, shares)[i]
payout[j]  = equity[j] + balance[j]                 (j != k)      // 각자 받을 금액
buyerPayment = Σ_{j != k} payout[j]                                // 인수자가 지급할 총액
payout[k]  = -buyerPayment                                         // 현금 지출 (자산은 k가 보유)
```
검산: `buyerPayment = (V - equity[k]) - balance[k]`.
인수자 `k`는 자신의 지분(`equity[k]`)은 유지하고 나머지 지분을 `buyerPayment`에 인수한다.

#### (c) 폐기 `method = 'disposal'`

```
base = (rule.salvageValue ?? 0) - (rule.disposalCost ?? 0)        // 보통 0 또는 음수
payout[i] = allocateByShare(base, shares)[i] + balance[i]
```
잔존가치가 있으면 지분대로 나눠 받고, 폐기비용은 지분대로 나눠 부담(음수 배분).
`base < 0`이면 `payout` 합계도 음수 → 참여자들이 부족분을 채운다.

### 4.4 워크스루 예시 (테스트 기준값)

- 자산: 냉장고, `P = 600,000`, `shareMode = 'contribution'`
- 참여자: A 납부 300,000 / B 납부 200,000 / C 납부 100,000 → `Σc = 600,000 = P`
- 지분: A `0.5` / B `1/3` / C `1/6`
- 비용: ① 수리비 60,000 (부담자 A, by_share) ② 배송비 30,000 (부담자 B, by_share) → `Σcost = 90,000`

**잔액** (`T = 690,000`):

| | paid | due | balance |
|---|---:|---:|---:|
| A | 300,000 + 60,000 = 360,000 | 0.5 × 690,000 = 345,000 | **+15,000** |
| B | 200,000 + 30,000 = 230,000 | 1/3 × 690,000 = 230,000 | **0** |
| C | 100,000 + 0 = 100,000 | 1/6 × 690,000 = 115,000 | **−15,000** |
| 합 | 690,000 | 690,000 | 0 |

**정산**, 현재 평가액 `V = 450,000`:

| 시나리오 | A | B | C | 합계 / 비고 |
|---|---:|---:|---:|---|
| **매각** (saleCost 0) `base=450,000` | 225,000 + 15,000 = **240,000** | 150,000 + 0 = **150,000** | 75,000 − 15,000 = **60,000** | 450,000 = base ✓ |
| **인수** (인수자 B) | 225,000 + 15,000 = **+240,000** | 자산 보유, **−300,000** 지급 | 75,000 − 15,000 = **+60,000** | `buyerPayment = 240,000 + 60,000 = 300,000` = (450,000 − 150,000) − 0 ✓ |
| **폐기** (R 0, D 20,000) `base=−20,000` | −10,000 + 15,000 = **+5,000** | −6,667 + 0 = **−6,667** | −3,333 − 15,000 = **−18,333** | 합계 −20,000 = base ✓ (배분: A −10,000 / B −6,667 / C −3,333) |

양수 = 받을 금액, 음수 = 추가 지급액. 각 줄에 `formula` 문자열(예: `50% × 450,000 + (+15,000) = 240,000`)을 함께 저장해 화면 근거 식으로 표시.

## 5. 화면 흐름

```
[1 홈 · 자산 목록]
   │  + 자산 추가
   ▼
[2 자산 생성]  ① 기본정보 → ② 참여자 → ③ 지분(납부액/균등) → ④ 확인(합계 100% 게이지)
   │  생성 완료
   ▼
[3 자산 상세 · 지분 확인]  요약(총액·평가액·내 지분·권리금액) / 탭: 지분 · 비용 · 종료규칙
   ├─ 탭 "비용"        → [4 공동비용 기록]  비용 목록 + 추가 시트 + 누적 부담액 대비표
   ├─ 탭 "종료규칙"    → [5 종료 규칙 합의]  매각 / 인수 / 폐기 + 합의 메모 저장
   └─ "정산 시뮬레이션" → [6 정산 결과]  현재 평가액 입력 → 참여자별 (지분가치 + 잔액 = 최종액)
                                          │  요약 공유
                                          ▼
                                    [7 공유 요약 (읽기 전용)]  합의 내용 + 최종 정산표
```

## 6. 상태 전이 (`Asset.status`)

```
active   ──(종료 규칙 확정 & 정산 시작)──▶  closing
closing  ──(정산 결과 확정)────────────▶  closed
closed / closing ──(되돌리기)──────────▶  active      // MVP: 되돌리기 허용, 이력은 남기지 않음
```

MVP에서 상태는 목록 배지 표시 용도이며 기능 잠금은 하지 않는다.

## 7. 저장소 인터페이스 (`lib/db`)

```
listAssets(): Asset[]
getAsset(id): { asset, participants, costs, notes, rule } | null
saveAsset(input): Asset
updateAsset(id, patch): Asset
deleteAsset(id): void
// participants / costs / notes / rule 도 동일한 CRUD 패턴
```

구현체는 `local-storage.ts` 하나. 키 네임스페이스 `woorimok:v1:*`. 스키마 버전을 키에 포함해 마이그레이션 여지를 둔다.
