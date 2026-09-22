import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_STORE, STORAGE_KEY, type StoreSchema } from "@/lib/storage/schema";
import { load, save } from "@/lib/storage/assetStore";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  } as Storage;
}

describe("assetStore", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createMemoryStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("정상 저장 후 그대로 복원된다", () => {
    const state: StoreSchema = {
      version: 1,
      assets: [
        {
          id: "a1",
          name: "공용 냉장고",
          totalAmount: 900000,
          splitMode: "equal",
          members: [],
          costs: [],
          termination: { kind: "sale" },
          status: "draft",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    expect(save(state)).toBe(true);
    const { data, loadError } = load();
    expect(loadError).toBe(false);
    expect(data).toEqual(state);
  });

  it("깨진 JSON이면 빈 스토어 + loadError: true", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not-valid-json");
    const { data, loadError } = load();
    expect(loadError).toBe(true);
    expect(data).toEqual(EMPTY_STORE);
  });

  it("스키마 버전이 다르면 빈 스토어 + loadError: true", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, assets: [] }));
    const { data, loadError } = load();
    expect(loadError).toBe(true);
    expect(data).toEqual(EMPTY_STORE);
  });

  it("키가 없으면 빈 스토어 + loadError: false", () => {
    const { data, loadError } = load();
    expect(loadError).toBe(false);
    expect(data).toEqual(EMPTY_STORE);
  });

  it("save가 예외를 던지면 false를 반환한다", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
        removeItem: () => {},
      },
    });
    expect(save({ version: 1, assets: [] })).toBe(false);
  });
});
