"use client";

import { use, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { StatusScreen } from "@/components/StatusScreen";
import { CostForm } from "@/components/CostForm";
import { CostList } from "@/components/CostList";
import { SectionHeader } from "@/components/Section";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { sumCostsByPayer } from "@/lib/calc/costs";
import { won } from "@/lib/calc/format";

// S4 비용 기록 — 출처: planning/md-design/03_UX_UI_SPEC.md S4
// 근거: FR-5, FR-6, R-3, R-10.
// 시각: Figma "04 비용 기록" — 새 비용 / 비용 목록(건수) / 참여자별 낸 비용(회색 카드 + 구분선 + 전체 합계), 섹션 간격 36px.
export default function CostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assets, mounted, addCost, deleteCost } = useAssetStore();
  const asset = assets.find((a) => a.id === id);

  const costTotals = useMemo(() => (asset ? sumCostsByPayer(asset) : []), [asset]);

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="비용 기록" backHref="/app" />
        <StatusScreen message="해당 자산을 찾을 수 없어요." actionLabel="목록으로 돌아가기" href="/app" />
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
      <AppHeader title="비용 기록" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
      <main className="flex flex-1 flex-col gap-9 px-5 pt-2 pb-10">
        <section className="flex flex-col gap-4">
          <SectionHeader title="새 비용" />
          <CostForm members={asset.members} onAdd={(entry) => addCost(asset.id, entry)} />
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader title="비용 목록" aside={`${asset.costs.length}건`} />
          <CostList entries={asset.costs} members={asset.members} onDelete={(costId) => deleteCost(asset.id, costId)} />
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader title="참여자별 낸 비용" />
          <dl className="flex flex-col gap-2.5 rounded-2xl bg-surface-muted p-4 text-[15px] leading-[22px] tabular-nums">
            {costTotals.map((row) => {
              const member = asset.members.find((m) => m.id === row.memberId);
              return (
                <div key={row.memberId} className="flex items-center text-text">
                  <dt className="min-w-0 flex-1">{member?.name}</dt>
                  <dd className="shrink-0">{won(row.paidTotal)}</dd>
                </div>
              );
            })}
            <div className="flex items-center border-t border-border pt-2.5 font-medium text-primary">
              <dt className="flex-1">전체 합계</dt>
              <dd className="shrink-0">{won(totalCost)}</dd>
            </div>
          </dl>
          <p className="text-xs leading-4 text-text-muted">비용 기록은 정산 금액에 반영되지 않아요</p>
        </section>
      </main>
    </>
  );
}
