"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { Asset, CostEntry, CreateAssetInput } from "@/lib/types";
import { clear as clearStorage, load, save } from "@/lib/storage/assetStore";
import {
  addAsset,
  addCost as addCostToAssets,
  buildAssetFromInput,
  deleteAsset as deleteAssetFromList,
  deleteCost as deleteCostFromAssets,
  updateAsset as updateAssetInList,
} from "@/lib/state/assetReducer";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §5

interface StoreState {
  assets: Asset[];
  loadError: boolean;
  saveError: boolean;
  mounted: boolean;
}

type StoreAction =
  | { type: "loaded"; assets: Asset[]; loadError: boolean }
  | { type: "createAsset"; asset: Asset }
  | { type: "deleteAsset"; id: string }
  | { type: "updateAsset"; id: string; patch: Partial<Asset> }
  | { type: "addCost"; assetId: string; entry: Omit<CostEntry, "id"> }
  | { type: "deleteCost"; assetId: string; costId: string }
  | { type: "saveFailed" }
  | { type: "reset" };

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "loaded":
      return { ...state, assets: action.assets, loadError: action.loadError, mounted: true };
    case "createAsset":
      return { ...state, assets: addAsset(state.assets, action.asset) };
    case "deleteAsset":
      return { ...state, assets: deleteAssetFromList(state.assets, action.id) };
    case "updateAsset":
      return { ...state, assets: updateAssetInList(state.assets, action.id, action.patch) };
    case "addCost":
      return { ...state, assets: addCostToAssets(state.assets, action.assetId, action.entry) };
    case "deleteCost":
      return { ...state, assets: deleteCostFromAssets(state.assets, action.assetId, action.costId) };
    case "saveFailed":
      return { ...state, saveError: true };
    case "reset":
      return { ...state, assets: [], loadError: false };
  }
}

const initialStoreState: StoreState = { assets: [], loadError: false, saveError: false, mounted: false };

interface AssetStoreContextValue extends StoreState {
  createAsset: (input: CreateAssetInput) => string;
  deleteAsset: (id: string) => void;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  addCost: (assetId: string, entry: Omit<CostEntry, "id">) => void;
  deleteCost: (assetId: string, costId: string) => void;
  resetStore: () => void;
}

const AssetStoreContext = createContext<AssetStoreContextValue | undefined>(undefined);

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
    const ok = save({ version: 1, assets: state.assets });
    if (!ok) dispatch({ type: "saveFailed" });
  }, [state.assets, state.mounted]);

  const createAsset = useCallback((input: CreateAssetInput) => {
    const asset = buildAssetFromInput(input);
    dispatch({ type: "createAsset", asset });
    return asset.id;
  }, []);

  const deleteAsset = useCallback((id: string) => {
    dispatch({ type: "deleteAsset", id });
  }, []);

  const updateAsset = useCallback((id: string, patch: Partial<Asset>) => {
    dispatch({ type: "updateAsset", id, patch });
  }, []);

  const addCost = useCallback((assetId: string, entry: Omit<CostEntry, "id">) => {
    dispatch({ type: "addCost", assetId, entry });
  }, []);

  const deleteCost = useCallback((assetId: string, costId: string) => {
    dispatch({ type: "deleteCost", assetId, costId });
  }, []);

  const resetStore = useCallback(() => {
    clearStorage();
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<AssetStoreContextValue>(
    () => ({
      ...state,
      createAsset,
      deleteAsset,
      updateAsset,
      addCost,
      deleteCost,
      resetStore,
    }),
    [state, createAsset, deleteAsset, updateAsset, addCost, deleteCost, resetStore],
  );

  return <AssetStoreContext.Provider value={value}>{children}</AssetStoreContext.Provider>;
}

export function useAssetStore(): AssetStoreContextValue {
  const ctx = useContext(AssetStoreContext);
  if (!ctx) {
    throw new Error("useAssetStore must be used within an AssetStoreProvider");
  }
  return ctx;
}

// 자산 상세·하위 화면 공용: 자산 1건 + 계산 파생값을 반환한다.
export function useAsset(id: string) {
  const store = useAssetStore();
  const asset = store.assets.find((a) => a.id === id);
  return { asset, store };
}
