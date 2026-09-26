import { describe, expect, it } from "vitest";
import { addMember, createAsset, removeMember } from "@/lib/state/assetReducer";
import type { Asset } from "@/lib/types";

function makeAsset(overrides: Partial<Asset>): Asset {
  return {
    id: "a1",
    name: "공용 냉장고",
    totalAmount: 900000,
    splitMode: "equal",
    members: [
      { id: "m1", name: "A", contribution: 0 },
      { id: "m2", name: "B", contribution: 0 },
    ],
    costs: [],
    termination: { kind: "sale" },
    status: "draft",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("createAsset", () => {
  it("제목이 있으면 목록에 새 항목을 추가한다", () => {
    const result = createAsset([], "공용 냉장고");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("공용 냉장고");
  });

  it("빈 제목은 추가하지 않는다", () => {
    const result = createAsset([], "");
    expect(result).toEqual([]);
  });

  it("공백만 있는 제목은 추가하지 않는다", () => {
    const result = createAsset([], "   ");
    expect(result).toEqual([]);
  });

  it("기존 목록을 유지하며 새 항목을 뒤에 추가한다", () => {
    const first = createAsset([], "첫번째");
    const second = createAsset(first, "두번째");
    expect(second.map((a) => a.name)).toEqual(["첫번째", "두번째"]);
  });
});

// docs/UX_IMPROVEMENT_PROPOSAL.md #4 — 자산 생성 후 참여자 추가·삭제.
describe("addMember", () => {
  it("참여자를 새 id로 목록 끝에 추가한다", () => {
    const asset = makeAsset({});
    const result = addMember([asset], "a1", { name: "C", contribution: 0 });
    expect(result[0].members.map((m) => m.name)).toEqual(["A", "B", "C"]);
    expect(result[0].members[2].id).not.toBe("");
  });

  it("이름 앞뒤 공백을 정리한다", () => {
    const asset = makeAsset({});
    const result = addMember([asset], "a1", { name: "  C  ", contribution: 0 });
    expect(result[0].members[2].name).toBe("C");
  });

  it("다른 자산에는 영향을 주지 않는다", () => {
    const asset1 = makeAsset({ id: "a1" });
    const asset2 = makeAsset({ id: "a2" });
    const result = addMember([asset1, asset2], "a1", { name: "C", contribution: 0 });
    expect(result.find((a) => a.id === "a2")?.members).toHaveLength(2);
  });
});

describe("removeMember", () => {
  it("해당 참여자를 제거한다", () => {
    const asset = makeAsset({});
    const result = removeMember([asset], "a1", "m1");
    expect(result[0].members.map((m) => m.id)).toEqual(["m2"]);
  });

  it("삭제된 참여자가 관리자였으면 관리자 지정을 해제한다", () => {
    const asset = makeAsset({ managerId: "m1" });
    const result = removeMember([asset], "a1", "m1");
    expect(result[0].managerId).toBeUndefined();
  });

  it("삭제된 참여자가 관리자가 아니면 관리자 지정을 유지한다", () => {
    const asset = makeAsset({ managerId: "m2" });
    const result = removeMember([asset], "a1", "m1");
    expect(result[0].managerId).toBe("m2");
  });
});
