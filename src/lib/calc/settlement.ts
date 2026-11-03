import type { Asset, SettlementResult, SettlementRow } from "@/lib/types";
import { computeShares } from "@/lib/calc/shares";
import { percent } from "@/lib/calc/format";

// 근거: 02_REQUIREMENTS_SPEC.md R-4, R-7. 04_TECHNICAL_DESIGN.md §7 computeSaleSettlement.
// 매각가가 없으면(미입력·0 이하) null — S6/S7은 이를 "입력 대기" 상태로 표시한다.
//
// 받을 금액 = 참여자 납부액 ÷ 총 구매금액 × 매각가 (균등 분할은 매각가 ÷ 참여자 수).
// 화면용으로 반올림한 지분율(예: 44.4%)을 곱하지 않고 원래 금액 비율로 계산해야 정확하다
// (예: 400,000 ÷ 900,000 × 450,000 = 200,000원. 44.5%를 곱하면 200,250원으로 틀어진다).
export function computeSaleSettlement(asset: Asset): SettlementResult | null {
  const salePrice = asset.salePrice;
  if (!salePrice || salePrice <= 0) return null;

  const shares = computeShares(asset);
  if (shares.length === 0) return { rows: [], salePrice, checkOk: salePrice === 0 };

  // 비율의 분자(weight)/분모. 납부액 모드의 분모는 납부액 합계 — 검증(checkContribution)을 통과한 자산에서는
  // 이 값이 총 구매금액과 같다. 균등 분할은 납부액이 0으로 저장되므로 참여자마다 1로 센다.
  const isEqual = asset.splitMode === "equal";
  const weights = asset.members.map((m) => (isEqual ? 1 : m.contribution));
  const denominator = weights.reduce((a, b) => a + b, 0);

  const rows: SettlementRow[] = shares.map((share, i) => ({
    memberId: share.memberId,
    // 곱셈을 먼저 해 부동소수 오차를 줄이고, 원 단위로 반올림한다.
    receive: denominator > 0 ? Math.round((weights[i] * salePrice) / denominator) : 0,
    formula: `지분 ${percent(share.sharePct)}`,
  }));

  // R-7: 받을 금액 합계가 매각가와 일치해야 한다. 원 단위 반올림 오차는 지분이 가장 큰 참여자에게 보정.
  const sum = rows.reduce((total, row) => total + row.receive, 0);
  const diff = salePrice - sum;

  if (diff !== 0) {
    const targetIndex = indexOfMax(weights);
    rows[targetIndex] = { ...rows[targetIndex], receive: rows[targetIndex].receive + diff };
  }

  const finalSum = rows.reduce((total, row) => total + row.receive, 0);
  const checkOk = finalSum === salePrice;

  return { rows, salePrice, checkOk };
}

function indexOfMax(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}
