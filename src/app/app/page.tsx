"use client";

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Banner } from "@/components/Banner";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { won } from "@/lib/calc/format";

// S1 자산 목록 — 출처: planning/md-design/03_UX_UI_SPEC.md S1
export default function AssetListPage() {
  const { assets, mounted, loadError, saveError, deleteAsset, resetStore } = useAssetStore();

  function handleDelete(id: string, name: string) {
    if (window.confirm(`"${name}"을(를) 삭제할까요? 되돌릴 수 없습니다.`)) {
      deleteAsset(id);
    }
  }

  return (
    <>
      <AppHeader title="자산 목록" />
      <main className="flex flex-1 flex-col gap-4 px-4 py-6">
        {loadError && (
          <Banner
            tone="error"
            message="저장된 데이터를 불러오지 못했습니다."
            action={{ label: "초기화", onClick: resetStore }}
          />
        )}
        {saveError && <Banner tone="warn" message="저장되지 않을 수 있습니다. 브라우저 설정을 확인해 주세요." />}

        {mounted && assets.length === 0 && (
          <EmptyState message="아직 등록한 자산이 없어요" actionLabel="자산 추가" actionHref="/app/assets/new" />
        )}

        {assets.length > 0 && (
          <ul className="flex flex-col gap-3">
            {assets.map((asset) => {
              const manager = asset.members.find((m) => m.id === asset.managerId);
              return (
                <li key={asset.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/app/assets/${asset.id}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate font-semibold text-text">{asset.name}</h2>
                        <StatusBadge asset={asset} />
                      </div>
                      <p className="mt-1 text-sm text-text-muted tabular-nums">
                        참여자 {asset.members.length}명 · 총 {won(asset.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        관리자: {manager ? manager.name : "미지정"}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id, asset.name)}
                      className="flex min-h-11 shrink-0 items-center rounded-xl px-2 text-xs text-text-muted hover:bg-surface-muted"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {assets.length > 0 && (
          <Link
            href="/app/assets/new"
            className="flex min-h-11 items-center self-center rounded-xl bg-primary-strong px-4 text-sm font-medium text-white"
          >
            자산 추가
          </Link>
        )}
      </main>
    </>
  );
}
