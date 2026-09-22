import type { AssetStatus, AssetWithStatus } from "@/lib/types";
import { checkContribution } from "@/lib/calc/shares";

// OpenSpec change `add-asset-core-flow` — design.md Goal 2:
// "상태 전환 규칙을 순수 함수 1개로 모아 테스트 가능하게".
// 근거: specs/asset-status/spec.md "전진 전환 규칙"·"후진 전환 규칙".
export function canTransition(asset: AssetWithStatus, to: AssetStatus): boolean {
  const { status } = asset;

  const forward =
    (status === "draft" && to === "agreed" && checkContribution(asset).ok) ||
    (status === "agreed" && to === "settled");

  const backward =
    (status === "agreed" && to === "draft") || (status === "settled" && to === "agreed");

  return forward || backward;
}
