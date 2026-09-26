"use client";

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";
import { won } from "@/lib/calc/format";

// 정산 현황 — 전체 자산의 정산 상태를 모아보는 화면 (탭바 2번째 탭).
// 이 화면 자체에서는 정산 내역을 직접 수정하지 않는다: "정산하기/정산 내역 수정"은
// 항상 해당 자산의 S6 정산 화면(assets/[id]/settlement)으로 이동해서 처리한다
// — 계산 로직·검증을 한 곳(S6)에만 두기 위함.
export default function SettlementsOverviewPage() {
  const { assets, mounted } = useAssetStore();

  return (
    <>
      <AppHeader title="정산 현황" />
      <main className="flex flex-1 flex-col gap-3 px-4 py-6">
        {mounted && assets.length === 0 && (
          <EmptyState message="등록된 자산이 없어요" actionLabel="자산 추가" actionHref="/app/assets/new" />
        )}

        {assets.length > 0 && (
          <ul className="flex flex-col gap-3">
            {assets.map((asset) => {
              const contributionCheck = checkContribution(asset);
              const blocked = !contributionCheck.ok;
              const settlement = blocked ? null : computeSaleSettlement(asset);
              const receiveTotal = settlement?.rows.reduce((sum, row) => sum + row.receive, 0) ?? 0;

              return (
                <li key={asset.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-text">{asset.name}</h2>
                      <p className="mt-1 text-xs text-text-muted tabular-nums">
                        참여자 {asset.members.length}명 · 총 {won(asset.totalAmount)}
                      </p>
                    </div>
                    <StatusBadge asset={asset} />
                  </div>

                  {settlement && (
                    <p className="mt-2 text-sm tabular-nums text-text">
                      매각가 {won(settlement.salePrice)} · 받을 금액 합계 {won(receiveTotal)}
                    </p>
                  )}

                  <Link
                    href={blocked ? `/app/assets/${asset.id}` : `/app/assets/${asset.id}/settlement`}
                    className="mt-3 flex min-h-11 items-center justify-center rounded-xl border border-border text-center text-sm font-medium text-text"
                  >
                    {blocked ? "자산 상세에서 확인하기" : settlement ? "정산 내역 수정" : "정산하기"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
