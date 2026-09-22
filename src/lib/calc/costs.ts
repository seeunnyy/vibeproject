import type { Asset, CostTotalRow } from "@/lib/types";

// 근거: 02_REQUIREMENTS_SPEC.md R-3 "낸 비용 합계 = 부담자로 기록된 비용 내역의 단순 합".
// 정산 계산에는 사용하지 않는다(R-10) — 표시 전용.
export function sumCostsByPayer(asset: Asset): CostTotalRow[] {
  return asset.members.map((member) => ({
    memberId: member.id,
    paidTotal: asset.costs
      .filter((cost) => cost.payerId === member.id)
      .reduce((total, cost) => total + cost.amount, 0),
  }));
}
