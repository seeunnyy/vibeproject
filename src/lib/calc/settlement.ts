import type { Asset, SettlementResult, SettlementRow } from "@/lib/types";
import { computeShares } from "@/lib/calc/shares";
import { comma } from "@/lib/calc/format";

// 근거: 02_REQUIREMENTS_SPEC.md R-4, R-7. 04_TECHNICAL_DESIGN.md §7 computeSaleSettlement.
// 매각가가 없으면(미입력·0 이하) null — S6/S7은 이를 "입력 대기" 상태로 표시한다.
export function computeSaleSettlement(asset: Asset): SettlementResult | null {
  const salePrice = asset.salePrice;
  if (!salePrice || salePrice <= 0) return null;

  const shares = computeShares(asset);
  if (shares.length === 0) return { rows: [], salePrice, checkOk: salePrice === 0 };

  const rows: SettlementRow[] = shares.map((share) => {
    const receive = Math.round((salePrice * share.sharePct) / 100);
    return {
      memberId: share.memberId,
      receive,
      formula: `${comma(salePrice)} × ${share.sharePct.toFixed(1)}%`,
    };
  });

  // R-7: 받을 금액 합계가 매각가와 일치해야 한다. 반올림 오차는 최대 지분자에게 보정.
  const sum = rows.reduce((total, row) => total + row.receive, 0);
  const diff = salePrice - sum;

  if (diff !== 0) {
    const targetIndex = indexOfMaxShare(shares.map((s) => s.sharePct));
    rows[targetIndex] = {
      ...rows[targetIndex],
      receive: rows[targetIndex].receive + diff,
    };
  }

  const finalSum = rows.reduce((total, row) => total + row.receive, 0);
  const checkOk = finalSum === salePrice;

  return { rows, salePrice, checkOk };
}

function indexOfMaxShare(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}
