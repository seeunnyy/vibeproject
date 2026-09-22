import { describe, expect, it } from "vitest";
import type { AssetWithStatus } from "@/lib/types";
import { canTransition } from "@/lib/calc/status";

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

describe("canTransition", () => {
  it("납부액 검증 통과 시 draft → agreed 허용", () => {
    const asset = makeAsset({
      status: "draft",
      totalAmount: 900000,
      members: [{ id: "m1", name: "A", contribution: 900000 }],
    });
    expect(canTransition(asset, "agreed")).toBe(true);
  });

  it("납부액 검증 실패 시 draft → agreed 차단", () => {
    const asset = makeAsset({
      status: "draft",
      totalAmount: 900000,
      members: [{ id: "m1", name: "A", contribution: 500000 }],
    });
    expect(canTransition(asset, "agreed")).toBe(false);
  });

  it("draft → settled 단계 건너뛰기 불가", () => {
    const asset = makeAsset({ status: "draft" });
    expect(canTransition(asset, "settled")).toBe(false);
  });

  it("settled → agreed 후진 전환 허용", () => {
    const asset = makeAsset({ status: "settled" });
    expect(canTransition(asset, "agreed")).toBe(true);
  });

  it("agreed → draft 후진 전환 허용", () => {
    const asset = makeAsset({ status: "agreed" });
    expect(canTransition(asset, "draft")).toBe(true);
  });

  it("agreed → settled 전진 전환은 납부액 검증과 무관하게 허용", () => {
    const asset = makeAsset({
      status: "agreed",
      totalAmount: 900000,
      members: [{ id: "m1", name: "A", contribution: 0 }],
    });
    expect(canTransition(asset, "settled")).toBe(true);
  });
});
