"use client";

import Link from "next/link";
import { LargeHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { ContributionDiffNote, StatusBadge } from "@/components/StatusBadge";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";
import { won } from "@/lib/calc/format";
import type { Asset } from "@/lib/types";

// 정산 현황 — 전체 자산의 정산 상태를 모아보는 화면 (탭바 2번째 탭).
// 이 화면 자체에서는 정산 내역을 직접 수정하지 않는다: "정산하기/정산 내역 수정"은
// 항상 해당 자산의 S6 정산 화면(assets/[id]/settlement)으로 이동해서 처리한다
// — 계산 로직·검증을 한 곳(S6)에만 두기 위함.
// 시각: Figma "08 정산 현황" — 캡션에 상태별 개수, 자산마다 회색 카드, 정산 완료면 흰 결과 박스, 오른쪽 파란 텍스트 링크.
function statusOf(asset: Asset) {
  const blocked = !checkContribution(asset).ok;
  const settlement = blocked ? null : computeSaleSettlement(asset);
  return { blocked, settlement };
}

export default function SettlementsOverviewPage() {
  const { assets, mounted } = useAssetStore();

  const statuses = assets.map(statusOf);
  const doneCount = statuses.filter((s) => s.settlement).length;
  const blockedCount = statuses.filter((s) => s.blocked).length;
  const pendingCount = assets.length - doneCount - blockedCount;
  const caption = mounted
    ? `정산 완료 ${doneCount} · 정산 전 ${pendingCount} · 확인 필요 ${blockedCount}`
    : undefined;

  return (
    <>
      <LargeHeader title="정산 현황" caption={caption} />
      <main className="flex flex-1 flex-col gap-3 px-5 pt-3 pb-6">
        {mounted && assets.length === 0 && (
          <EmptyState message="등록된 자산이 없어요" actionLabel="자산 추가" actionHref="/app/assets/new" />
        )}

        {assets.length > 0 && (
          <ul className="flex flex-col gap-3">
            {assets.map((asset, i) => {
              const { blocked, settlement } = statuses[i];
              const receiveTotal = settlement?.rows.reduce((sum, row) => sum + row.receive, 0) ?? 0;

              return (
                <li key={asset.id} className="flex flex-col gap-2.5 rounded-2xl bg-surface-muted px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="min-w-0 flex-1 truncate text-[15px] leading-[22px] font-medium text-primary">
                      {asset.name}
                    </h2>
                    <StatusBadge asset={asset} />
                  </div>
                  <p className="text-[13px] leading-[18px] text-text-muted tabular-nums">
                    참여자 {asset.members.length}명 · 총 {won(asset.totalAmount)}
                  </p>
                  <ContributionDiffNote asset={asset} />

                  {settlement && (
                    <dl className="flex flex-col gap-1.5 rounded-xl bg-surface px-3.5 py-3 tabular-nums">
                      <div className="flex items-center">
                        <dt className="flex-1 text-[13px] leading-[18px] text-text-muted">매각가</dt>
                        <dd className="text-sm leading-5 font-medium text-primary">{won(settlement.salePrice)}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="flex-1 text-[13px] leading-[18px] text-text-muted">받을 금액 합계</dt>
                        <dd className="text-sm leading-5 font-medium text-primary">{won(receiveTotal)}</dd>
                      </div>
                    </dl>
                  )}

                  <Link
                    href={blocked ? `/app/assets/${asset.id}` : `/app/assets/${asset.id}/settlement`}
                    className="flex min-h-11 items-center gap-0.5 self-end text-sm leading-5 font-medium text-primary-strong"
                  >
                    {blocked ? "자산 상세에서 확인하기" : settlement ? "정산 내역 수정" : "정산하기"}
                    <Icon name="chevron-right" size={18} />
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
