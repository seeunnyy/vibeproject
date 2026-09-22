import type { ContributionCheck } from "@/lib/types";
import { won } from "@/lib/calc/format";

// 출처: 03_UX_UI_SPEC.md §4 — ContributionCheckBadge
// 근거: FR-3, R-9. "납부액 합계 = 총 구매금액" 여부를 항상 텍스트로 표시(색만 쓰지 않음).
export function ContributionCheckBadge({ check }: { check: ContributionCheck }) {
  if (check.ok) {
    return (
      <p className="flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
        <span aria-hidden="true">✓</span> 납부액 합계가 총 구매금액과 일치합니다
      </p>
    );
  }

  if (check.sum === 0) {
    return (
      <p role="alert" className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
        <span aria-hidden="true">⚠</span> 납부액 합계가 0이라 지분을 계산할 수 없습니다
      </p>
    );
  }

  const diffLabel = check.diff > 0 ? `${won(check.diff)} 적습니다` : `${won(Math.abs(check.diff))} 많습니다`;

  return (
    <p role="alert" className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <span aria-hidden="true">⚠</span> 총 구매금액보다 {diffLabel} (현재 합계 {won(check.sum)})
    </p>
  );
}
