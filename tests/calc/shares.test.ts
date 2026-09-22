import { describe, expect, it } from "vitest";
import type { Asset } from "@/lib/types";
import { computeShares } from "@/lib/calc/shares";

function makeAsset(overrides: Partial<Asset>): Asset {
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

describe("computeShares", () => {
  it("납부액 비율 50/30/20 → 지분율 50.0/33.3/16.7, 합계 100.0", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [
        { id: "m1", name: "A", contribution: 450000 },
        { id: "m2", name: "B", contribution: 300000 },
        { id: "m3", name: "C", contribution: 150000 },
      ],
    });
    const rows = computeShares(asset);
    expect(rows.map((r) => r.sharePct)).toEqual([50, 33.3, 16.7]);
    expect(rows.reduce((sum, r) => sum + r.sharePct, 0)).toBeCloseTo(100, 5);
  });

  it("1/3씩 균등 납부 → 33.4/33.3/33.3, 합계 100.0", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [
        { id: "m1", name: "A", contribution: 300000 },
        { id: "m2", name: "B", contribution: 300000 },
        { id: "m3", name: "C", contribution: 300000 },
      ],
    });
    const rows = computeShares(asset);
    expect(rows.map((r) => r.sharePct)).toEqual([33.4, 33.3, 33.3]);
  });

  it("균등 분할 3인 → 33.4/33.3/33.3, 합계 100.0 (잔여는 첫 참여자)", () => {
    const asset = makeAsset({
      splitMode: "equal",
      members: [
        { id: "m1", name: "A", contribution: 0 },
        { id: "m2", name: "B", contribution: 0 },
        { id: "m3", name: "C", contribution: 0 },
      ],
    });
    const rows = computeShares(asset);
    expect(rows.map((r) => r.sharePct)).toEqual([33.4, 33.3, 33.3]);
    expect(rows[0].formula).toBe("100 ÷ 3");
  });

  it("참여자가 없으면 빈 배열", () => {
    expect(computeShares(makeAsset({ members: [] }))).toEqual([]);
  });

  it("납부액 합계가 0이면 전원 0%", () => {
    const asset = makeAsset({
      members: [
        { id: "m1", name: "A", contribution: 0 },
        { id: "m2", name: "B", contribution: 0 },
      ],
    });
    const rows = computeShares(asset);
    expect(rows.map((r) => r.sharePct)).toEqual([0, 0]);
  });
});
