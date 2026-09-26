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
// 소수 첫째 자리까지 반올림하되, 정수(십분위) 단위로 계산해 부동소수 오차를 피하고
// 반올림 잔여를 규칙대로 한 참여자에게 몰아줘 합계가 항상 100.0%가 되게 한다.
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

  // 십분위(0.1% 단위) 정수로 반올림해 계산 → 합계 오차를 정수 연산으로 다룬다.
  const tenths = members.map((m) => {
    const raw = isEqual ? 1000 / members.length : (m.contribution / contributionSum) * 1000;
    return Math.round(raw);
  });

  const sumTenths = tenths.reduce((a, b) => a + b, 0);
  const remainder = 1000 - sumTenths;

  if (remainder !== 0) {
    // R-1/R-2: 균등이면 첫 참여자, 납부액 모드면 납부액이 가장 큰 참여자에게 잔여 배분.
    const targetIndex = isEqual ? 0 : indexOfMax(members.map((m) => m.contribution));
    tenths[targetIndex] += remainder;
  }

  return members.map((m, i) => {
    const sharePct = tenths[i] / 10;
    const formula = isEqual
      ? `100 ÷ ${members.length}`
      : `${comma(m.contribution)} ÷ ${comma(contributionSum)}`;
    return { memberId: m.id, sharePct, formula };
  });
}

function indexOfMax(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}
