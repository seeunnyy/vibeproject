import { describe, expect, it } from "vitest";
import { createAsset } from "@/lib/state/assetReducer";

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
