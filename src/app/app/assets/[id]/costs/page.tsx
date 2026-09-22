"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { CostForm } from "@/components/CostForm";
import { CostList } from "@/components/CostList";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { sumCostsByPayer } from "@/lib/calc/costs";
import { won } from "@/lib/calc/format";

// S4 비용 기록 — 출처: planning/md-design/03_UX_UI_SPEC.md S4
// 근거: FR-5, FR-6, R-3, R-10.
export default function CostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assets, mounted, addCost, deleteCost } = useAssetStore();
  const asset = assets.find((a) => a.id === id);

  const costTotals = useMemo(() => (asset ? sumCostsByPayer(asset) : []), [asset]);

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="비용 기록" backHref="/app" />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-text-muted">해당 자산을 찾을 수 없어요.</p>
          <Link href="/app" className="text-sm text-primary-strong underline">
            목록으로 돌아가기
          </Link>
        </main>
      </>
    );
  }

  if (!asset) {
    return (
      <>
        <AppHeader title="비용 기록" backHref="/app" />
        <main className="flex-1" />
      </>
    );
  }

  const totalCost = asset.costs.reduce((sum, c) => sum + c.amount, 0);

  return (
    <>
      <AppHeader title="비용 기록" backHref={`/app/assets/${asset.id}`} />
      <main className="flex flex-1 flex-col gap-5 px-4 py-6">
        <CostForm members={asset.members} onAdd={(entry) => addCost(asset.id, entry)} />

        <section>
          <h2 className="mb-2 text-sm font-medium text-text">비용 목록</h2>
          <CostList entries={asset.costs} members={asset.members} onDelete={(costId) => deleteCost(asset.id, costId)} />
        </section>

        <section className="rounded-2xl border border-border bg-surface-muted p-4">
          <h2 className="mb-2 text-sm font-medium text-text">참여자별 낸 비용 합계</h2>
          <ul className="flex flex-col gap-1 text-sm text-text">
            {costTotals.map((row) => {
              const member = asset.members.find((m) => m.id === row.memberId);
              return (
                <li key={row.memberId} className="flex justify-between tabular-nums">
                  <span>{member?.name}</span>
                  <span>{won(row.paidTotal)}</span>
                </li>
              );
            })}
            <li className="mt-1 flex justify-between border-t border-border pt-1 font-medium tabular-nums">
              <span>전체 합계</span>
              <span>{won(totalCost)}</span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-text-muted">정산에는 반영되지 않습니다.</p>
        </section>
      </main>
    </>
  );
}
