import type { Asset, ContributionCheck, ShareRow } from "@/lib/types";
import { comma } from "@/lib/calc/format";

// 근거: specs/asset-registration/spec.md "Requirement: 납부액 합계 검증"
// 02_REQUIREMENTS_SPEC.md R-9, R-11.
export function checkContribution(asset: Asset): ContributionCheck {
  const target = asset.totalAmount;

  // design.md D2: "draft→agreed 는 checkContribution(asset).ok (균등 모드는 항상 true)".
  // 균등 모드는 검증할 납부액 자체가 없으므로 항상 통과로 취급한다.
  if (asset.splitMode === "equal") {
    return { sum: target, target, diff: 0, ok: true, hasNegativeMember: false };
  }

  const sum = asset.members.reduce((total, member) => total + member.contribution, 0);
  const diff = target - sum;

  // 개별 납부액이 음수면 지분도 음수로 계산된다. 합계만 우연히 총액과 맞아떨어져도(diff===0)
  // 이 상태는 무조건 실패로 처리한다. 근거: docs/USABILITY_HEURISTIC_REVIEW.md #5(자가검진에서
  // "1,300,000 / -400,000"이 "합계 일치"로 통과되던 사례를 실제 재현함).
  const hasNegativeMember = asset.members.some((member) => member.contribution < 0);
  if (hasNegativeMember) {
    return { sum, target, diff, ok: false, hasNegativeMember: true };
  }

  // R-11: 납부액 합계가 0이면(전원 미입력/0) 지분 계산 불가 → 항상 실패.
  if (sum === 0) {
    return { sum, target, diff, ok: false, hasNegativeMember: false };
  }

  return { sum, target, diff, ok: diff === 0, hasNegativeMember: false };
}

// 근거: specs/asset-registration/spec.md "Requirement: 지분율 자동 산출"
// 02_REQUIREMENTS_SPEC.md R-1, R-2. 04_TECHNICAL_DESIGN.md §7 computeShares.
//
// sharePct는 반올림하지 않은 원래 비율(예: 44.444…)이다. 소수 첫째 자리 반올림은 화면에 표시할 때만
// (`percent()` / `toFixed(1)`) 한다. 그래서 표시값 합계가 99.9%처럼 100.0%와 조금 다를 수 있지만,
// 정산 금액은 이 반올림 값이 아니라 원래 금액 비율로 계산한다(settlement.ts).
export function computeShares(asset: Asset): ShareRow[] {
  const { members, splitMode } = asset;
  if (members.length === 0) return [];

  const isEqual = splitMode === "equal";
  const contributionSum = members.reduce((total, m) => total + m.contribution, 0);

  // 지분을 계산할 근거가 없는 경우(납부액 모드인데 합계 0) 전원 0%로 반환한다.
  // 실제 화면에서는 checkContribution의 ok:false로 이 상태를 먼저 막아야 한다.
  if (!isEqual && contributionSum === 0) {
    return members.map((m) => ({ memberId: m.id, sharePct: 0, formula: `0 ÷ 0` }));
  }

  return members.map((m) => {
    const sharePct = isEqual ? 100 / members.length : (m.contribution / contributionSum) * 100;
    const formula = isEqual
      ? `100 ÷ ${members.length}`
      : `${comma(m.contribution)} ÷ ${comma(contributionSum)}`;
    return { memberId: m.id, sharePct, formula };
  });
}

// 균등 분할 자산의 참여자별 부담액. 균등 모드는 납부액을 0으로 저장하므로, 화면·요약에 "얼마를 부담하는지"를
// 보여줄 때마다 이 함수로 계산한다(저장하지 않음 → 참여자를 추가·삭제하면 자동으로 다시 계산된다).
// 규칙: 부담액 = 총 구매금액 ÷ 참여자 수를 원 단위로 내림하고, 나누고 남은 원은 참여자 목록 첫 번째 사람에게 더한다.
// 그래서 합계가 항상 총 구매금액과 정확히 같다(예: 100,000원 3명 → 33,334 / 33,333 / 33,333).
export function computeEqualBurdens(asset: Asset): Array<{ memberId: string; burden: number }> {
  const count = asset.members.length;
  if (count === 0) return [];
  const base = Math.floor(asset.totalAmount / count);
  const remainder = asset.totalAmount - base * count;
  return asset.members.map((m, i) => ({ memberId: m.id, burden: i === 0 ? base + remainder : base }));
}
