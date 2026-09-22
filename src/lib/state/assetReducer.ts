import type { Asset } from "@/lib/types";

// 최소 생성 슬라이스: 제목(name)만 받아 자산을 추가한다.
// 총 구매금액·참여자 등 나머지 필드는 이후 작업(5.1)에서 실제 폼으로 채운다.
export function createAsset(assets: Asset[], name: string): Asset[] {
  const title = name.trim();
  if (!title) return assets;

  const now = new Date().toISOString();
  const newAsset: Asset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: title,
    totalAmount: 0,
    splitMode: "equal",
    members: [],
    costs: [],
    termination: { kind: "sale" },
    createdAt: now,
    updatedAt: now,
  };

  return [...assets, newAsset];
}
