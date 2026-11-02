import type { Asset } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";
import { isEnded } from "@/lib/labels";

// 출처: docs/UX_IMPROVEMENT_PROPOSAL.md #6 — 자산 목록(01)·정산 현황(08)이 같은 상태 판정을 쓰도록 한 곳에 둔다.
// 시각: Figma 01·08 — 색 배경 없이 13px 글자(+14px 아이콘).
// - 종료됨(인수·폐기): medium · muted
// - 납부액 확인 필요: medium · error + ⚠
// - 정산 완료: medium · primary-strong + ✓
// - 정산 전: regular · muted
export function StatusBadge({ asset }: { asset: Asset }) {
  if (isEnded(asset)) {
    return <span className="shrink-0 text-[13px] leading-[18px] font-medium text-text-muted">종료됨</span>;
  }

  const blocked = !checkContribution(asset).ok;
  if (blocked) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[13px] leading-[18px] font-medium text-error">
        <Icon name="alert" size={14} />
        납부액 확인 필요
      </span>
    );
  }

  if (computeSaleSettlement(asset)) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[13px] leading-[18px] font-medium text-primary-strong">
        <Icon name="check" size={14} />
        정산 완료
      </span>
    );
  }

  return <span className="shrink-0 text-[13px] leading-[18px] text-text-muted">정산 전</span>;
}
