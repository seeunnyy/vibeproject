// 도메인 타입 정의.
// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §4
// MD-design 트랙과 OpenSpec 트랙(add-asset-core-flow)이 각자 실험하던 `Asset` / `AssetWithStatus`를
// 여기서 하나로 합친다: 실제 서비스는 상태(status) 없이 존재할 이유가 없으므로 `status`를
// `Asset` 본체 필드로 승격하고, `AssetWithStatus`는 기존 코드·테스트 호환을 위한 별칭으로 남긴다.

export type SplitMode = "contribution" | "equal";

export type CostType = "repair" | "purchase" | "shipping";

// specs/asset-status/spec.md "Requirement: 상태값"
export type AssetStatus = "draft" | "agreed" | "settled";

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
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}

// 기존 OpenSpec 트랙 코드·테스트 호환용 별칭. 신규 코드는 `Asset`을 바로 쓴다.
export type AssetWithStatus = Asset;

// 자산 생성 입력 (폼 → reducer). id/createdAt/updatedAt/status는 reducer가 부여한다.
// members는 폼에서만 의미 있는 임시 id(tempId)로 서로를 구분한다 — 동명이인이어도
// managerTempId로 정확히 어느 참여자를 관리자로 지정했는지 알 수 있게 하기 위함이다.
export interface CreateAssetInput {
  name: string;
  purchaseDate?: string;
  totalAmount: number;
  splitMode: SplitMode;
  members: Array<{ tempId: string; name: string; contribution: number }>;
  managerTempId?: string; // members 중 관리자로 지정할 참여자 (없으면 미지정)
  agreementNote?: string;
}

// 파생값 (저장하지 않음, 계산 결과)
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
  // 참여자 개별 납부액에 음수가 있는지. 합계가 총액과 맞아떨어져도(diff===0) 이 값이 true면 ok는
  // 무조건 false — 근거: docs/USABILITY_HEURISTIC_REVIEW.md #5.
  hasNegativeMember: boolean;
}
