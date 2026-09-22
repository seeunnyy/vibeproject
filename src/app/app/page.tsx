"use client";

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";

// S1 자산 목록 — 출처: planning/md-design/03_UX_UI_SPEC.md S1
// 최소 슬라이스: 물건명 목록만 렌더링. 필터·상태 배지·삭제는 이후 작업(6.x)에서 추가.
export default function AssetListPage() {
  const { assets, mounted } = useAssetStore();

  return (
    <>
      <AppHeader title="자산 목록" />
      <main className="flex flex-1 flex-col gap-4 px-4 py-10">
        {mounted && assets.length === 0 && (
          <p className="text-center text-sm text-neutral-600">아직 등록한 자산이 없어요</p>
        )}
        {assets.length > 0 && (
          <ul className="flex flex-col gap-2">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="rounded-md border border-neutral-200 px-4 py-3 text-sm"
              >
                {asset.name}
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/app/assets/new"
          className="self-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          자산 추가
        </Link>
      </main>
    </>
  );
}
