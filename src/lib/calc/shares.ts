import type { AssetWithStatus, ContributionCheck } from "@/lib/types";

// OpenSpec change `add-asset-core-flow` — design.md Goal 2가 의존하는 D5 범위.
// 근거: specs/asset-registration/spec.md "Requirement: 납부액 합계 검증".
// computeShares(지분율 자동 산출, 3.1)는 이 Goal이 쓰지 않으므로 아직 구현하지 않는다.
export function checkContribution(asset: AssetWithStatus): ContributionCheck {
  const target = asset.totalAmount;

  // design.md D2: "draft→agreed 는 checkContribution(asset).ok (균등 모드는 항상 true)".
  // 균등 모드는 검증할 납부액 자체가 없으므로 항상 통과로 취급한다.
  if (asset.splitMode === "equal") {
    return { sum: target, target, diff: 0, ok: true };
  }

  const sum = asset.members.reduce((total, member) => total + member.contribution, 0);
  const diff = target - sum;

  return { sum, target, diff, ok: diff === 0 };
}
