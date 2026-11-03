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

  it("납부액 ÷ 총 구매금액 × 매각가: 400,000/300,000/200,000원, 매각가 450,000원 → 200,000/150,000/100,000원", () => {
    const result = computeSaleSettlement(
      makeAsset({
        salePrice: 450000,
        members: [
          { id: "m1", name: "A", contribution: 400000 },
          { id: "m2", name: "B", contribution: 300000 },
          { id: "m3", name: "C", contribution: 200000 },
        ],
      }),
    );
    expect(result).not.toBeNull();
    expect(result!.rows.map((r) => r.receive)).toEqual([200000, 150000, 100000]);
    expect(result!.rows.map((r) => r.formula)).toEqual(["지분 44.4%", "지분 33.3%", "지분 22.2%"]);
    expect(result!.checkOk).toBe(true);
  });

  it("원 단위 반올림 차액은 지분이 가장 큰 참여자에게 더한다", () => {
    // 매각가 100,000원: 44,444.4 / 33,333.3 / 22,222.2 → 반올림 합계 99,999원 → 차액 1원은 A(최대 지분)에게
    const result = computeSaleSettlement(
      makeAsset({
        salePrice: 100000,
        members: [
          { id: "m1", name: "A", contribution: 400000 },
          { id: "m2", name: "B", contribution: 300000 },
          { id: "m3", name: "C", contribution: 200000 },
        ],
      }),
    );
    expect(result!.rows.map((r) => r.receive)).toEqual([44445, 33333, 22222]);
    expect(result!.checkOk).toBe(true);
  });

  it("균등 분할은 매각가 ÷ 참여자 수", () => {
    const result = computeSaleSettlement(
      makeAsset({
        splitMode: "equal",
        salePrice: 450000,
        members: [
          { id: "m1", name: "A", contribution: 0 },
          { id: "m2", name: "B", contribution: 0 },
          { id: "m3", name: "C", contribution: 0 },
        ],
      }),
    );
    expect(result!.rows.map((r) => r.receive)).toEqual([150000, 150000, 150000]);
  });

  it("반올림 오차가 나는 매각가에서도 합계 = 매각가", () => {
    const result = computeSaleSettlement(makeAsset({ salePrice: 1000000 }));
    expect(result).not.toBeNull();
    const sum = result!.rows.reduce((total, row) => total + row.receive, 0);
    expect(sum).toBe(1000000);
    expect(result!.checkOk).toBe(true);
  });
});
