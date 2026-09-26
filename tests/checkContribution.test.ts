import { describe, expect, it } from "vitest";
import type { AssetWithStatus } from "@/lib/types";
import { checkContribution } from "@/lib/calc/shares";

function makeAsset(overrides: Partial<AssetWithStatus>): AssetWithStatus {
  return {
    id: "a1",
    name: "공용 냉장고",
    totalAmount: 900000,
    splitMode: "contribution",
    members: [],
    costs: [],
    termination: { kind: "sale" },
    status: "draft",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("checkContribution", () => {
  it("납부액 합계가 총 구매금액과 일치하면 ok", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [
        { id: "m1", name: "A", contribution: 450000 },
        { id: "m2", name: "B", contribution: 300000 },
        { id: "m3", name: "C", contribution: 150000 },
      ],
    });
    const result = checkContribution(asset);
    expect(result).toEqual({ sum: 900000, target: 900000, diff: 0, ok: true, hasNegativeMember: false });
  });

  it("합계가 총 구매금액보다 적으면 부족 표시", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [{ id: "m1", name: "A", contribution: 850000 }],
    });
    const result = checkContribution(asset);
    expect(result).toEqual({
      sum: 850000,
      target: 900000,
      diff: 50000,
      ok: false,
      hasNegativeMember: false,
    });
  });

  it("합계가 총 구매금액보다 많으면 초과 표시", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [{ id: "m1", name: "A", contribution: 950000 }],
    });
    const result = checkContribution(asset);
    expect(result).toEqual({
      sum: 950000,
      target: 900000,
      diff: -50000,
      ok: false,
      hasNegativeMember: false,
    });
  });

  // 자가검진(docs/USABILITY_HEURISTIC_REVIEW.md #5)에서 재현한 케이스: 개별 납부액이 음수여도
  // 합계만 총액과 맞아떨어지면 통과되던 버그. 합계가 정확히 맞아도 무조건 실패해야 한다.
  it("개별 납부액에 음수가 있으면 합계가 총 구매금액과 같아도 실패", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [
        { id: "m1", name: "A", contribution: 1300000 },
        { id: "m2", name: "B", contribution: -400000 },
      ],
    });
    const result = checkContribution(asset);
    expect(result.ok).toBe(false);
    expect(result.hasNegativeMember).toBe(true);
    expect(result.diff).toBe(0); // 합계 자체는 총액과 일치 — 그래도 ok는 false여야 함
  });

  it("납부액 합계가 0이면 실패", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [
        { id: "m1", name: "A", contribution: 0 },
        { id: "m2", name: "B", contribution: 0 },
      ],
    });
    const result = checkContribution(asset);
    expect(result.ok).toBe(false);
    expect(result.sum).toBe(0);
  });

  it("균등 모드는 항상 ok", () => {
    const asset = makeAsset({ splitMode: "equal", totalAmount: 900000, members: [] });
    const result = checkContribution(asset);
    expect(result.ok).toBe(true);
  });
});
