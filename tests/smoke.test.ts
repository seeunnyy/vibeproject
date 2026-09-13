import { describe, expect, it } from "vitest";
import { EMPTY_STORE, STORAGE_KEY } from "@/lib/storage/schema";
import { load } from "@/lib/storage/assetStore";

// 오늘 슬라이스(scaffolding/shell) 동작을 확인하는 최소 스모크 테스트.
// 실제 계산/영속성 로직 테스트는 해당 로직이 구현되는 슬라이스에서 추가한다.
describe("scaffolding smoke test", () => {
  it("EMPTY_STORE는 빈 자산 배열을 가진다", () => {
    expect(EMPTY_STORE.version).toBe(1);
    expect(EMPTY_STORE.assets).toEqual([]);
  });

  it("STORAGE_KEY가 정의되어 있다", () => {
    expect(STORAGE_KEY).toBe("woorimok.store.v1");
  });

  it("load()는 오늘 기준 stub으로 빈 스토어를 반환한다", () => {
    const { data, loadError } = load();
    expect(loadError).toBe(false);
    expect(data.assets).toEqual([]);
  });
});
