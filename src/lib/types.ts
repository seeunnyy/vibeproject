// 도메인 타입 정의.
// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §4
// 오늘(route/shell/type/placeholder 슬라이스)은 이 타입들을 정의만 하고 실제 로직에서는
// 아직 사용하지 않는다. `Asset.status`(OpenSpec change `add-asset-core-flow`가 추가한 필드)는
// 이 공통 타입에 포함하지 않는다 — MD 문서(04)에는 없는 필드이며, MD 기반 구현과 OpenSpec 기반
// 구현을 비교하기 위해 각 트랙이 필요 시 별도로 확장한다.

export type SplitMode = "contribution" | "equal";

export type CostType = "repair" | "purchase" | "shipping";

export interface Member {
  id: string; // uuid
  name: string;
  contribution: number; // 납부액(원). equal 모드면 0
}

export interface CostEntry {
  id: string;
  type: CostType;
  amount: number; // 원, > 0
  payerId: string; // Member.id
  date: string; // ISO yyyy-mm-dd
  memo?: string;
}

// MVP는 'sale'만 사용. buyout·disposal은 다음 버전(02 부록 A)
export type TerminationRule =
  | { kind: "sale" }
  | { kind: "buyout"; buyerId: string } // 다음 버전
  | { kind: "disposal" }; // 다음 버전

export interface Asset {
  id: string;
  name: string;
  purchaseDate?: string; // ISO, 선택
  totalAmount: number; // 원, > 0
  splitMode: SplitMode;
  members: Member[]; // length >= 2
  managerId?: string; // Member.id, 선택
  agreementNote?: string; // 구매 시 합의 메모, 선택
  terminationNote?: string; // 종료 관련 합의 메모, 선택
  costs: CostEntry[];
  termination: TerminationRule; // MVP: { kind: 'sale' } 고정
  salePrice?: number; // 매각가
  createdAt: string;
  updatedAt: string;
}

// 파생값 (저장하지 않음, 계산 결과) — 계산 함수는 오늘 범위 밖, 타입만 선언
export interface ShareRow {
  memberId: string;
  sharePct: number;
  formula: string;
}

export interface CostTotalRow {
  memberId: string;
  paidTotal: number;
}

export interface SettlementRow {
  memberId: string;
  receive: number;
  formula: string;
}

export interface SettlementResult {
  rows: SettlementRow[];
  salePrice: number;
  checkOk: boolean;
}

export interface ContributionCheck {
  sum: number;
  target: number;
  diff: number;
  ok: boolean;
}

// OpenSpec change `add-asset-core-flow` — design.md Goal 1:
// "04 §4 데이터 모델에 status 필드 1개만 추가하고 나머지 Asset 형태는 그대로 유지".
// 공용 Asset은 건드리지 않고 OpenSpec 트랙 전용 확장으로 둔다(파일 상단 주석 참조).
// 값 집합 근거: specs/asset-status/spec.md "Requirement: 상태값".
export type AssetStatus = "draft" | "agreed" | "settled";

export interface AssetWithStatus extends Asset {
  status: AssetStatus;
}
