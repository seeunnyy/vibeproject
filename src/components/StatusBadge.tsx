import type { Asset } from "@/lib/types";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";

// 출처: docs/UX_IMPROVEMENT_PROPOSAL.md #6 — "정산 현황" 탭에만 있던 상태 배지를 자산 목록(S1)에도
// 동일하게 재사용한다. 목록 화면마다 "조치가 필요한 자산인지" 표시 기준이 달라지지 않게 계산 로직
// 자체를 이 컴포넌트 하나로 모았다.
export function StatusBadge({ asset }: { asset: Asset }) {
  const blocked = !checkContribution(asset).ok;
  const settlement = blocked ? null : computeSaleSettlement(asset);

  if (blocked) {
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
        납부액 확인 필요
      </span>
    );
  }

  if (settlement) {
    return (
      <span className="shrink-0 rounded-full bg-primary-strong/10 px-2 py-1 text-xs font-medium text-primary-strong">
        정산 완료
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-surface-muted px-2 py-1 text-xs font-medium text-text-muted">
      정산 전
    </span>
  );
}
