import type { ContributionCheck } from "@/lib/types";
import { won } from "@/lib/calc/format";
import { Icon } from "@/components/Icon";

// 출처: 03_UX_UI_SPEC.md §4 — ContributionCheckBadge
// 근거: FR-3, R-9. "납부액 합계 = 총 구매금액" 여부를 항상 텍스트로 표시(색만 쓰지 않음).
// 시각: Figma 02·03 시안 — 배경 박스 없이 16px 아이콘 + 13px 글자. 정상은 success, 문제는 error.
const ERROR = "flex items-start gap-1.5 text-[13px] leading-[18px] font-medium text-error";

export function ContributionCheckBadge({ check }: { check: ContributionCheck }) {
  if (check.hasNegativeMember) {
    return (
      <p role="alert" className={ERROR}>
        <Icon name="alert" size={16} className="mt-px" /> 참여자 납부액에 음수가 있어요. 납부액을 다시 확인해 주세요
      </p>
    );
  }

  if (check.ok) {
    return (
      <p className="flex items-start gap-1.5 text-[13px] leading-[18px] text-success">
        <Icon name="check" size={16} className="mt-px" /> 납부액 합계가 총 구매금액과 일치합니다
      </p>
    );
  }

  if (check.sum === 0) {
    return (
      <p role="alert" className={ERROR}>
        <Icon name="alert" size={16} className="mt-px" /> 납부액 합계가 0이라 지분을 계산할 수 없습니다
      </p>
    );
  }

  const diffLabel = check.diff > 0 ? `${won(check.diff)} 적습니다` : `${won(Math.abs(check.diff))} 많습니다`;

  return (
    <p role="alert" className={ERROR}>
      <Icon name="alert" size={16} className="mt-px" /> 총 구매금액보다 {diffLabel} (현재 합계 {won(check.sum)})
    </p>
  );
}
