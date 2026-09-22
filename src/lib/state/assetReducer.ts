import type { Asset, CostEntry, CreateAssetInput } from "@/lib/types";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §5 (State — 액션 표)
// 여기 함수들은 모두 순수 함수(입력이 같으면 출력이 같음)로 두어 테스트 가능하게 한다.
// state에 실제로 반영·저장하는 일은 AssetStoreProvider가 한다.

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 최소 생성 슬라이스에서 쓰던 "제목만" 생성. 기존 테스트(tests/assetReducer.test.ts) 호환을 위해 유지한다.
export function createAsset(assets: Asset[], name: string): Asset[] {
  const title = name.trim();
  if (!title) return assets;

  const now = new Date().toISOString();
  const newAsset: Asset = {
    id: generateId(),
    name: title,
    totalAmount: 0,
    splitMode: "equal",
    members: [],
    costs: [],
    termination: { kind: "sale" },
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  return [...assets, newAsset];
}

// S2 전체 폼 제출 → 완성된 Asset 1건을 만든다(목록에 아직 추가하지 않음).
// 근거: specs/asset-registration/spec.md, 02_REQUIREMENTS_SPEC.md FR-1/R-9/R-13.
export function buildAssetFromInput(input: CreateAssetInput): Asset {
  const now = new Date().toISOString();
  const tempIdToRealId = new Map<string, string>();

  const members = input.members.map((m) => {
    const id = generateId();
    tempIdToRealId.set(m.tempId, id);
    return { id, name: m.name.trim(), contribution: input.splitMode === "equal" ? 0 : m.contribution };
  });

  const managerId = input.managerTempId ? tempIdToRealId.get(input.managerTempId) : undefined;

  return {
    id: generateId(),
    name: input.name.trim(),
    purchaseDate: input.purchaseDate || undefined,
    totalAmount: input.totalAmount,
    splitMode: input.splitMode,
    members,
    managerId,
    agreementNote: input.agreementNote?.trim() || undefined,
    costs: [],
    termination: { kind: "sale" },
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export function addAsset(assets: Asset[], asset: Asset): Asset[] {
  return [...assets, asset];
}

export function updateAsset(assets: Asset[], id: string, patch: Partial<Asset>): Asset[] {
  const now = new Date().toISOString();
  return assets.map((asset) => (asset.id === id ? { ...asset, ...patch, updatedAt: now } : asset));
}

export function deleteAsset(assets: Asset[], id: string): Asset[] {
  return assets.filter((asset) => asset.id !== id);
}

export function addCost(assets: Asset[], assetId: string, entry: Omit<CostEntry, "id">): Asset[] {
  const now = new Date().toISOString();
  return assets.map((asset) =>
    asset.id === assetId
      ? { ...asset, costs: [{ ...entry, id: generateId() }, ...asset.costs], updatedAt: now }
      : asset,
  );
}

export function deleteCost(assets: Asset[], assetId: string, costId: string): Asset[] {
  const now = new Date().toISOString();
  return assets.map((asset) =>
    asset.id === assetId
      ? { ...asset, costs: asset.costs.filter((cost) => cost.id !== costId), updatedAt: now }
      : asset,
  );
}
