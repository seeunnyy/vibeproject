import { describe, expect, it } from "vitest";
import type { Asset } from "@/lib/types";
import { computeEqualBurdens, computeShares } from "@/lib/calc/shares";

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
  it("납부액 비율 50/33.3/16.7 → 반올림하지 않은 비율을 그대로 반환", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [
        { id: "m1", name: "A", contribution: 450000 },
        { id: "m2", name: "B", contribution: 300000 },
        { id: "m3", name: "C", contribution: 150000 },
      ],
    });
    const rows = computeShares(asset);
    expect(rows.map((r) => r.sharePct.toFixed(1))).toEqual(["50.0", "33.3", "16.7"]);
    expect(rows.reduce((sum, r) => sum + r.sharePct, 0)).toBeCloseTo(100, 5);
  });

  it("1/3씩 균등 납부 → 표시 33.3/33.3/33.3 (보정 없음)", () => {
    const asset = makeAsset({
      totalAmount: 900000,
      members: [
        { id: "m1", name: "A", contribution: 300000 },
        { id: "m2", name: "B", contribution: 300000 },
        { id: "m3", name: "C", contribution: 300000 },
      ],
    });
    const rows = computeShares(asset);
    expect(rows.map((r) => r.sharePct.toFixed(1))).toEqual(["33.3", "33.3", "33.3"]);
  });

  it("균등 분할 3인 → 표시 33.3/33.3/33.3", () => {
    const asset = makeAsset({
      splitMode: "equal",
      members: [
        { id: "m1", name: "A", contribution: 0 },
        { id: "m2", name: "B", contribution: 0 },
        { id: "m3", name: "C", contribution: 0 },
      ],
    });
    const rows = computeShares(asset);
    expect(rows.map((r) => r.sharePct.toFixed(1))).toEqual(["33.3", "33.3", "33.3"]);
    expect(rows[0].formula).toBe("100 ÷ 3");
  });

  it("400,000/300,000/200,000 → 표시 44.4/33.3/22.2 (화면 표시 때만 반올림)", () => {
    const asset = makeAsset({
      members: [
        { id: "m1", name: "A", contribution: 400000 },
        { id: "m2", name: "B", contribution: 300000 },
        { id: "m3", name: "C", contribution: 200000 },
      ],
    });
    expect(computeShares(asset).map((r) => r.sharePct.toFixed(1))).toEqual(["44.4", "33.3", "22.2"]);
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

describe("computeEqualBurdens", () => {
  const member = (id: string) => ({ id, name: id, contribution: 0 });

  it("나누어떨어지면 모두 같은 금액: 450,000원 2명 → 225,000 / 225,000", () => {
    const asset = makeAsset({ splitMode: "equal", totalAmount: 450000, members: [member("m1"), member("m2")] });
    expect(computeEqualBurdens(asset)).toEqual([
      { memberId: "m1", burden: 225000 },
      { memberId: "m2", burden: 225000 },
    ]);
  });

  it("남는 원은 첫 번째 참여자에게: 100,000원 3명 → 33,334 / 33,333 / 33,333, 합계 = 총 구매금액", () => {
    const asset = makeAsset({
      splitMode: "equal",
      totalAmount: 100000,
      members: [member("m1"), member("m2"), member("m3")],
    });
    const burdens = computeEqualBurdens(asset);
    expect(burdens.map((b) => b.burden)).toEqual([33334, 33333, 33333]);
    expect(burdens.reduce((sum, b) => sum + b.burden, 0)).toBe(100000);
  });

  it("참여자를 추가하면 다시 계산된다: 450,000원 2명 → 3명이면 150,000씩", () => {
    const before = makeAsset({ splitMode: "equal", totalAmount: 450000, members: [member("m1"), member("m2")] });
    const after = { ...before, members: [...before.members, member("m3")] };
    expect(computeEqualBurdens(before).map((b) => b.burden)).toEqual([225000, 225000]);
    expect(computeEqualBurdens(after).map((b) => b.burden)).toEqual([150000, 150000, 150000]);
    expect(computeEqualBurdens(after).reduce((sum, b) => sum + b.burden, 0)).toBe(450000);
  });
});
