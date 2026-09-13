import type { Asset } from "@/lib/types";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §4.1
export interface StoreSchema {
  version: 1;
  assets: Asset[];
}

export const STORAGE_KEY = "woorimok.store.v1";

export const EMPTY_STORE: StoreSchema = {
  version: 1,
  assets: [],
};
