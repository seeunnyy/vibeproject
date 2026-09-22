"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { Asset } from "@/lib/types";
import { load, save } from "@/lib/storage/assetStore";
import { createAsset as createAssetInList } from "@/lib/state/assetReducer";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §5
// OpenSpec 트랙 최소 슬라이스: createAsset(제목만) 액션까지 구현.
// deleteAsset/setStatus 등 나머지 액션은 이후 작업에서 추가한다.

interface AssetStoreState {
  assets: Asset[];
  loadError: boolean;
  mounted: boolean;
  createAsset: (name: string) => void;
}

interface StoreState {
  assets: Asset[];
  loadError: boolean;
  mounted: boolean;
}

type StoreAction =
  | { type: "loaded"; assets: Asset[]; loadError: boolean }
  | { type: "create"; name: string };

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "loaded":
      return { assets: action.assets, loadError: action.loadError, mounted: true };
    case "create":
      return { ...state, assets: createAssetInList(state.assets, action.name) };
  }
}

const initialStoreState: StoreState = { assets: [], loadError: false, mounted: false };

const AssetStoreContext = createContext<AssetStoreState | undefined>(undefined);

export function AssetStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialStoreState);
  const skipNextSaveRef = useRef(true);

  useEffect(() => {
    // 마운트 후 1회만 localStorage(외부 시스템)에서 읽어와 동기화한다(SSR 안전 가드).
    const { data, loadError } = load();
    dispatch({ type: "loaded", assets: data.assets, loadError });
  }, []);

  useEffect(() => {
    if (!state.mounted) return;
    if (skipNextSaveRef.current) {
      // 방금 load()로 채운 데이터를 그대로 다시 저장하지 않는다.
      skipNextSaveRef.current = false;
      return;
    }
    save({ version: 1, assets: state.assets });
  }, [state.assets, state.mounted]);

  const createAsset = useCallback((name: string) => {
    dispatch({ type: "create", name });
  }, []);

  const value = useMemo(
    () => ({ assets: state.assets, loadError: state.loadError, mounted: state.mounted, createAsset }),
    [state.assets, state.loadError, state.mounted, createAsset],
  );

  return <AssetStoreContext.Provider value={value}>{children}</AssetStoreContext.Provider>;
}

export function useAssetStore(): AssetStoreState {
  const ctx = useContext(AssetStoreContext);
  if (!ctx) {
    throw new Error("useAssetStore must be used within an AssetStoreProvider");
  }
  return ctx;
}
