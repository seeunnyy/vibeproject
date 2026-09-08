# 04. TECHNICAL DESIGN — 우리몫

> **이 문서의 책임**: route / source structure / data model / state / storage.
> **이 문서가 다루지 않는 것**: 문제·가치·범위(→ 01), 기능·규칙·인수조건(→ 02), 화면 레이아웃·카피·접근성(→ 03), 일정·오늘 구현 범위·QA(→ 05).
> **상태**: Draft · **작성일**: 2026-09-08 · **개정**: 2026-09-08 (2회차 점검 반영) · **참고**: 구조 원문 `docs/ARCHITECTURE.md`

---

## 1. 스택 (확정)
- Next.js (App Router) · React · TypeScript
- Tailwind CSS
- 저장소: 브라우저 `localStorage` (서버·DB·외부 API 없음)
- 테스트: Vitest (계산 모듈 단위 테스트 한정)
- 배포: Vercel (정적/CSR)

제약(CLAUDE.md): 결제·복잡 인증·실시간 협업·대용량 업로드·다수 외부 API 금지. 불필요한 의존성 추가 금지.

## 2. Route 설계

| Route | 화면(03) | 렌더링 | 비고 |
|---|---|---|---|
| `/` | S0 랜딩 | 정적 | |
| `/app` | S1 자산 목록 | CSR | 마운트 후 스토어 로드 |
| `/app/assets/new` | S2 자산 생성 | CSR | 생성 후 `/app/assets/[id]`로 replace |
| `/app/assets/[id]` | S3 자산 상세 | CSR | `[id]` = 자산 id. 없으면 `/app`으로 리다이렉트 + 배너 |
| `/app/assets/[id]/costs` | S4 비용 기록 | CSR | |
| `/app/assets/[id]/termination` | S5 종료 규칙 | CSR | 매각 고정. 납부액 검증 실패 시 `/app/assets/[id]`로 유도 |
| `/app/assets/[id]/settlement` | S6 정산 | CSR | 납부액 검증 실패 시 `/app/assets/[id]`로 유도 |
| `/app/assets/[id]/summary` | S7 공유 요약 | CSR | 매각가 없으면 정산 영역 비우고 안내 |

- 모든 `/app/**`는 클라이언트 컴포넌트(`'use client'`). SSR 시 `localStorage` 접근 불가 → 각 페이지는 `next/dynamic`의 `{ ssr: false }`로 뷰를 감싸 단순화한다(화면별 커스텀 스켈레톤 불필요).

## 3. Source Structure

```
src/
  app/
    page.tsx                              # S0
    app/
      layout.tsx                          # AppShell (스토어 provider)
      page.tsx                            # S1
      assets/
        new/page.tsx                      # S2
        [id]/
          page.tsx                        # S3
          costs/page.tsx                  # S4
          termination/page.tsx            # S5
          settlement/page.tsx             # S6
          summary/page.tsx                # S7
  components/                             # 03 §4 컴포넌트 (프레젠테이션, 계산 안 함)
    AppHeader.tsx
    FormField.tsx  NumberInput.tsx
    MemberRepeater.tsx  ManagerSelect.tsx  AgreementNote.tsx  SplitModeToggle.tsx
    ContributionCheckBadge.tsx
    MemberTable.tsx  FormulaText.tsx
    CostForm.tsx  CostList.tsx
    SettlementResult.tsx  AmountLabel.tsx
    SummaryView.tsx
    EmptyState.tsx  Banner.tsx
  lib/
    types.ts                             # 도메인 타입 (§4)
    calc/
      shares.ts                          # 지분 계산        (R-1, R-2, R-11)
      costs.ts                           # 참여자별 낸 비용 합계 (R-3)
      settlement.ts                      # 매각 정산        (R-4, R-7)
      format.ts                          # 금액/산출식 문자열 (R-8, FR-9)
    storage/
      assetStore.ts                      # localStorage 어댑터 (§6)
      schema.ts                          # StoreSchema, STORAGE_KEY
    state/
      AssetStoreProvider.tsx             # Context + reducer (§5)
      useAsset.ts                        # 단일 자산 + 파생값 훅
tests/
  calc/
    shares.test.ts
    costs.test.ts
    settlement.test.ts
docs/                                    # 기존 문서
planning/                                # 설계 문서
```

- `lib/calc/*` 는 React 비의존 순수 함수. `tests/`가 이 모듈만 대상으로 함.
- `components/` 는 계산하지 않고 `lib/calc` 결과를 표시만 함.
- `lib/state/` 만 `localStorage`에 쓴다. 화면은 state 액션을 호출.
- 인수·폐기 정산 컴포넌트/모듈(`settlement`의 buyout·disposal 분기)은 다음 버전에서 추가.

## 4. Data Model

```ts
// src/lib/types.ts (개념 정의, 구현 아님)

export type SplitMode = 'contribution' | 'equal'
export type CostType = 'repair' | 'purchase' | 'shipping'

export interface Member {
  id: string           // uuid
  name: string
  contribution: number // 납부액(원). equal 모드면 0
}

export interface CostEntry {
  id: string
  type: CostType
  amount: number       // 원, > 0
  payerId: string      // Member.id
  date: string         // ISO yyyy-mm-dd
  memo?: string
}

// MVP는 'sale'만 사용. buyout·disposal은 다음 버전(02 부록 A)
export type TerminationRule =
  | { kind: 'sale' }
  | { kind: 'buyout'; buyerId: string }   // 다음 버전
  | { kind: 'disposal' }                  // 다음 버전

export interface Asset {
  id: string
  name: string
  purchaseDate?: string   // ISO, 선택
  totalAmount: number      // 원, > 0
  splitMode: SplitMode
  members: Member[]        // length >= 2
  managerId?: string       // Member.id, 선택 (R-13)
  agreementNote?: string   // 구매 시 합의 메모, 선택
  terminationNote?: string // 종료 관련 합의 메모, 선택
  costs: CostEntry[]
  termination: TerminationRule   // MVP: { kind: 'sale' } 고정
  salePrice?: number             // 매각가, S6에서 입력
  createdAt: string
  updatedAt: string
}

// 파생(저장 안 함, 계산 결과)
export interface ShareRow      { memberId: string; sharePct: number; formula: string }
export interface CostTotalRow  { memberId: string; paidTotal: number }
export interface SettlementRow { memberId: string; receive: number; formula: string }
export interface SettlementResult {
  rows: SettlementRow[]
  salePrice: number
  checkOk: boolean       // 받을 금액 합계 === 매각가 (R-7)
}

// 납부액 검증 (R-9, FR-3)
export interface ContributionCheck {
  sum: number            // 참여자 납부액 합계
  target: number         // 총 구매금액
  diff: number           // sum - target
  ok: boolean            // diff === 0
}
```

### 4.1 저장 스키마
```ts
// src/lib/storage/schema.ts
export interface StoreSchema {
  version: 1
  assets: Asset[]
}
export const STORAGE_KEY = 'woorimok.store.v1'
```
- `version`이 1이 아니거나 파싱 실패 시 → 빈 스토어(`{ version: 1, assets: [] }`) 반환 + 로드 실패 플래그. (마이그레이션 로직은 스키마가 실제로 바뀔 때 도입 — 지금은 없음)

## 5. State

- **범위**: 전역 상태는 "자산 배열" 하나. Context + `useReducer` (추가 의존성 없음).
- **Provider**: `AssetStoreProvider` (`src/app/app/layout.tsx`에서 감쌈)
  - 마운트 시 `assetStore.load()` → 초기 state. 로드 실패 플래그를 함께 보관해 S1에서 배너 표시.
  - state 변경 시 `assetStore.save(state)` **즉시 호출** (데이터 규모가 작아 debounce 불필요).
- **액션 (reducer)**:
  | 액션 | 인자 | 효과 |
  |---|---|---|
  | `createAsset` | draft | 새 자산 추가. id·createdAt·updatedAt 부여. `termination = { kind: 'sale' }` |
  | `updateAsset` | id, patch | 자산 필드 병합(물건명·구매일·관리자·합의 메모 등), updatedAt 갱신 |
  | `deleteAsset` | id | 자산 제거 |
  | `addCost` | assetId, entry | costs에 추가 |
  | `deleteCost` | assetId, costId | costs에서 제거 |
  | `setTerminationNote` | assetId, text | 종료 합의 메모 설정 |
  | `setSalePrice` | assetId, price | 매각가 설정 |
- **파생값**: 화면에서 `useMemo`로 `lib/calc` 호출.
  - `computeShares(asset) → ShareRow[]`
  - `checkContribution(asset) → ContributionCheck`
  - `sumCostsByPayer(asset) → CostTotalRow[]`
  - `computeSaleSettlement(asset) → SettlementResult | null` (매각가 없으면 null)
  - 파생값은 state·storage에 저장하지 않음.
- **선택 훅**: `useAsset(id)` — 자산 1건 + 위 파생값 반환. 없으면 `null`.
- **SSR 안전**: `/app/**` 페이지는 `dynamic(() => import(...), { ssr: false })`로 감싼다.

## 6. Storage

- **매체**: `window.localStorage`, 단일 키 `woorimok.store.v1`.
- **형식**: `JSON.stringify(StoreSchema)`.
- **어댑터 API** (`src/lib/storage/assetStore.ts`):
  | 함수 | 설명 |
  |---|---|
  | `load(): { data: StoreSchema; loadError: boolean }` | 키 읽기 → parse → `version` 검사. 실패 시 빈 스토어 + `loadError: true` |
  | `save(state: StoreSchema): void` | `JSON.stringify` 후 저장. `QuotaExceededError` 등은 잡아서 콘솔 경고 (MVP 규모에선 사실상 발생 안 함) |
  | `clear(): void` | 키 삭제 (S1 "초기화") |
  | `toSummaryText(asset, derived): string` | S7 "요약 복사"용 평문 텍스트 생성 |
- **쓰기 시점**: reducer dispatch마다 즉시 저장.
- **경계**:
  - 브라우저·기기 간 동기화 없음(로컬 전용).
  - 개인정보·금액은 외부로 전송하지 않음(NFR-6).
  - 시크릿 모드·저장 차단 환경: `save`가 조용히 실패할 수 있으므로 세션 메모리 상태로 계속 동작하고, 최초 실패 시 S1/S3에 "저장되지 않을 수 있음" 배너 1회 표시.

## 7. 계산 모듈 시그니처 (구현 다음 회차)

| 모듈 | 시그니처 | 규칙 |
|---|---|---|
| `shares` | `computeShares(asset): ShareRow[]` / `checkContribution(asset): ContributionCheck` | R-1, R-2, R-9, R-11 · 순수 함수 |
| `costs` | `sumCostsByPayer(asset): CostTotalRow[]` | R-3 (단순 합) |
| `settlement` | `computeSaleSettlement(asset): SettlementResult \| null` | R-4, R-7 · 매각가 없으면 null · 검증 실패는 예외 아닌 `checkOk: false` |
| `format` | `won(n): string`, `formula(a, b): string` | R-8, FR-9 |

- 반올림·통화 표기는 계산이 아니라 표시 직전 `format`에서 적용. 단, 매각 정산의 잔여 오차 보정(R-7)은 `settlement` 내부에서 최대 지분자에게 1회 반영.
- 모든 계산 함수는 입력이 같으면 출력이 같아야 함(테스트 기준).

## 8. 결정 완료 / 남은 결정
| ID | 항목 | 상태 |
|---|---|---|
| D-1 | 배포 = Vercel | 완료 |
| D-2 | 테스트 러너 = Vitest | 완료 |
| D-3 | 상태 관리 = Context + useReducer, 즉시 저장 | 완료 |
| D-4 | 공유 요약 = 평문 텍스트 클립보드 복사 | 완료 (02 Q-1) |
| D-5 | 지분 소수점 = 소수 1자리 반올림, 잔여는 최대 납부자/첫 참여자 | 완료 (R-1) |
| D-6 | 정산 범위 = 매각 1종. 인수·폐기는 다음 버전 | 완료 (01 §5.2, 02 부록 A) |
| D-7 | 생성 후 참여자·자산 편집 | 다음 버전 (02 Q-4) |
