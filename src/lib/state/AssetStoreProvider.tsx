"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Asset } from "@/lib/types";
import { load } from "@/lib/storage/assetStore";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §5
// 오늘은 Context 정의 + 마운트 가드까지만 구현한다.
// createAsset/deleteAsset 등 reducer 액션은 각 구현 트랙(MD 기반 / OpenSpec 기반)에서
// 자신의 문서에 맞춰 추가한다.

interface AssetStoreState {
  assets: Asset[];
  loadError: boolean;
  mounted: boolean;
}

const AssetStoreContext = createContext<AssetStoreState | undefined>(undefined);

export function AssetStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AssetStoreState>({
    assets: [],
    loadError: false,
    mounted: false,
  });

  useEffect(() => {
    // 마운트 후 1회만 localStorage(외부 시스템)에서 읽어와 동기화한다(SSR 안전 가드).
    const { data, loadError } = load();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ assets: data.assets, loadError, mounted: true });
  }, []);

  return (
    <AssetStoreContext.Provider value={state}>{children}</AssetStoreContext.Provider>
  );
}

export function useAssetStore(): AssetStoreState {
  const ctx = useContext(AssetStoreContext);
  if (!ctx) {
    throw new Error("useAssetStore must be used within an AssetStoreProvider");
  }
  return ctx;
}
