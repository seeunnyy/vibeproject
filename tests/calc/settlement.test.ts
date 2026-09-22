import { describe, expect, it } from "vitest";
import type { Asset } from "@/lib/types";
import { computeSaleSettlement } from "@/lib/calc/settlement";

function makeAsset(overrides: Partial<Asset>): Asset {
  return {
    id: "a1",
    name: "공용 냉장고",
    totalAmount: 900000,
    splitMode: "contribution",
    members: [
      { id: "m1", name: "A", contribution: 450000 },
      { id: "m2", name: "B", contribution: 300000 },
      { id: "m3", name: "C", contribution: 150000 },
    ],
    costs: [],
    termination: { kind: "sale" },
    status: "draft",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeSaleSettlement", () => {
  it("매각가가 없으면 null", () => {
    expect(computeSaleSettlement(makeAsset({ salePrice: undefined }))).toBeNull();
    expect(computeSaleSettlement(makeAsset({ salePrice: 0 }))).toBeNull();
  });

  it("매각가 × 지분율로 받을 금액을 계산하고 합계가 매각가와 일치한다", () => {
    const result = computeSaleSettlement(makeAsset({ salePrice: 1200000 }));
    expect(result).not.toBeNull();
    expect(result!.checkOk).toBe(true);
    const sum = result!.rows.reduce((total, row) => total + row.receive, 0);
    expect(sum).toBe(1200000);
    // 50.0% / 33.3% / 16.7% 기준
    expect(result!.rows[1].receive).toBe(Math.round(1200000 * 0.333));
  });

  it("반올림 오차가 나는 매각가에서도 합계 = 매각가", () => {
    const result = computeSaleSettlement(makeAsset({ salePrice: 1000000 }));
    expect(result).not.toBeNull();
    const sum = result!.rows.reduce((total, row) => total + row.receive, 0);
    expect(sum).toBe(1000000);
    expect(result!.checkOk).toBe(true);
  });
});
