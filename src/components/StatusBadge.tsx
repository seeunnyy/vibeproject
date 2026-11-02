import type { Asset } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";
import { won } from "@/lib/calc/format";

// 출처: docs/UX_IMPROVEMENT_PROPOSAL.md #6 — "정산 현황" 탭에만 있던 상태 배지를 자산 목록(S1)에도
// 동일하게 재사용한다. 목록 화면마다 "조치가 필요한 자산인지" 표시 기준이 달라지지 않게 계산 로직
// 자체를 이 컴포넌트 하나로 모았다.
export function StatusBadge({ asset }: { asset: Asset }) {
  const blocked = !checkContribution(asset).ok;
  const settlement = blocked ? null : computeSaleSettlement(asset);

  // 색 배경 pill 없이 글자(굵기·색) + 아이콘으로 상태를 구분한다(Figma 01·08 시안).
  // 조치가 필요한 "납부액 확인 필요"만 error 색, "정산 완료"는 primary-strong, "정산 전"은 muted.
  // 색만으로 구분하지 않도록 아이콘과 문구를 함께 둔다.
  if (blocked) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[13px] leading-[18px] font-medium text-error">
        <Icon name="alert" size={14} />
        납부액 확인 필요
      </span>
    );
  }

  if (settlement) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[13px] leading-[18px] font-medium text-primary-strong">
        <Icon name="check" size={14} />
        정산 완료
      </span>
    );
  }

  return <span className="shrink-0 text-[13px] leading-[18px] text-text-muted">정산 전</span>;
}

// 목록 카드(자산 목록·정산 현황)에서 "납부액 확인 필요" 상태일 때 이유를 한 줄로 덧붙인다(Figma 01·08).
export function ContributionDiffNote({ asset }: { asset: Asset }) {
  const check = checkContribution(asset);
  if (check.ok || check.sum === 0 || check.diff === 0) return null;
  return (
    <p className="text-[13px] leading-[18px] text-error tabular-nums">
      납부액 합계가 총 구매금액보다 {won(Math.abs(check.diff))} {check.diff > 0 ? "적어요" : "많아요"}
    </p>
  );
}
