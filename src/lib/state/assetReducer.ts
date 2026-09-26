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

// 자산 생성 후 참여자 추가. 근거: docs/UX_IMPROVEMENT_PROPOSAL.md #4.
// 이름·납부액은 추가 시점에 함께 받는다(추가 후 별도 수정 UI는 이번 범위에 없음 — 기존 참여자의
// 납부액 수정 불가 문제는 이번 개선안의 대상이 아니었다).
export function addMember(
  assets: Asset[],
  assetId: string,
  input: { name: string; contribution: number },
): Asset[] {
  const now = new Date().toISOString();
  return assets.map((asset) =>
    asset.id === assetId
      ? {
          ...asset,
          members: [
            ...asset.members,
            { id: generateId(), name: input.name.trim(), contribution: input.contribution },
          ],
          updatedAt: now,
        }
      : asset,
  );
}

// 참여자 삭제. "최소 2명 유지"·"이미 비용을 낸 참여자는 삭제 금지" 같은 조건은 호출부(페이지)에서
// 미리 걸러 이 함수까지 오지 않게 한다 — Splitwise의 "잔액이 남은 멤버는 삭제 금지" 가드레일과 같은
// 취지(docs/UX_IMPROVEMENT_PROPOSAL.md #4). 이 함수 자체는 다른 reducer 함수들처럼 조건 없이
// 순수하게 제거만 한다.
export function removeMember(assets: Asset[], assetId: string, memberId: string): Asset[] {
  const now = new Date().toISOString();
  return assets.map((asset) =>
    asset.id === assetId
      ? {
          ...asset,
          members: asset.members.filter((m) => m.id !== memberId),
          managerId: asset.managerId === memberId ? undefined : asset.managerId,
          updatedAt: now,
        }
      : asset,
  );
}
