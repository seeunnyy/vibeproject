import { describe, expect, it } from "vitest";
import type { Asset } from "@/lib/types";
import { sumCostsByPayer } from "@/lib/calc/costs";

function makeAsset(overrides: Partial<Asset>): Asset {
  return {
    id: "a1",
    name: "공용 냉장고",
    totalAmount: 900000,
    splitMode: "contribution",
    members: [
      { id: "m1", name: "A", contribution: 450000 },
      { id: "m2", name: "B", contribution: 450000 },
    ],
    costs: [],
    termination: { kind: "sale" },
    status: "draft",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("sumCostsByPayer", () => {
  it("부담자별 단순 합계를 계산한다", () => {
    const asset = makeAsset({
      costs: [
        { id: "c1", type: "repair", amount: 20000, payerId: "m1", date: "2026-01-02" },
        { id: "c2", type: "shipping", amount: 5000, payerId: "m1", date: "2026-01-03" },
        { id: "c3", type: "purchase", amount: 10000, payerId: "m2", date: "2026-01-04" },
      ],
    });
    const rows = sumCostsByPayer(asset);
    expect(rows).toEqual([
      { memberId: "m1", paidTotal: 25000 },
      { memberId: "m2", paidTotal: 10000 },
    ]);
  });

  it("비용이 없으면 전원 0", () => {
    const rows = sumCostsByPayer(makeAsset({ costs: [] }));
    expect(rows).toEqual([
      { memberId: "m1", paidTotal: 0 },
      { memberId: "m2", paidTotal: 0 },
    ]);
  });
});
