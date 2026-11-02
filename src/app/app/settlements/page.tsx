"use client";

import Link from "next/link";
import { LargeHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";
import { won } from "@/lib/calc/format";
import { TERMINATION_LABEL, isEnded, withJosa } from "@/lib/labels";
import type { Asset } from "@/lib/types";

// 정산 현황 — 전체 자산의 정산 상태를 모아보는 화면 (탭바 2번째 탭).
// 이 화면 자체에서는 정산 내역을 직접 수정하지 않는다: "정산하기/정산 내역 수정"은
// 항상 해당 자산의 S6 정산 화면(assets/[id]/settlement)으로 이동해서 처리한다
// — 계산 로직·검증을 한 곳(S6)에만 두기 위함.
// 시각: Figma "08 정산 현황" — 캡션에 상태별 개수, 자산마다 회색 카드, 정산 완료면 흰 결과 박스, 오른쪽 파란 텍스트 링크.
function statusOf(asset: Asset) {
  const ended = isEnded(asset);
  const blocked = !ended && !checkContribution(asset).ok;
  const settlement = ended || blocked ? null : computeSaleSettlement(asset);
  return { ended, blocked, settlement };
}

function actionOf(asset: Asset, { ended, blocked, settlement }: ReturnType<typeof statusOf>) {
  if (ended) return { label: "요약 보기", href: `/app/assets/${asset.id}/summary` };
  if (blocked) return { label: "자산 상세에서 확인하기", href: `/app/assets/${asset.id}` };
  return { label: settlement ? "정산 내역 수정" : "정산하기", href: `/app/assets/${asset.id}/settlement` };
}

export default function SettlementsOverviewPage() {
  const { assets, mounted } = useAssetStore();

  const statuses = assets.map(statusOf);

  return (
    <>
      <LargeHeader title="정산 현황" />
      {/* 빈 상태일 때는 자산 목록과 같은 아래 여백(pb-2)을 써서 Figma 시안(2163:550)과 같은 세로 위치에 둔다. */}
      <main className={`flex flex-1 flex-col gap-3 px-5 pt-3 ${mounted && assets.length === 0 ? "pb-2" : "pb-6"}`}>
        {mounted && assets.length === 0 && (
          // 시각: Figma "정산 현황 · 빈 상태"(node 2163:550) — 자산 목록 빈 상태와 같은 픽토그램·문구·버튼.
          <EmptyState
            illustration="/illustrations/empty-assets.svg"
            title="아직 등록한 자산이 없어요"
            actionLabel="첫 자산 등록하기"
            actionHref="/app/assets/new"
          />
        )}

        {assets.length > 0 && (
          <ul className="flex flex-col gap-3">
            {assets.map((asset, i) => {
              const status = statuses[i];
              const { settlement } = status;
              const action = actionOf(asset, status);
              const receiveTotal = settlement?.rows.reduce((sum, row) => sum + row.receive, 0) ?? 0;

              return (
                <li key={asset.id} className="flex flex-col gap-2.5 rounded-2xl bg-surface-muted p-4">
                  <div className="flex items-center gap-2">
                    <h2 className="min-w-0 flex-1 truncate text-[15px] leading-[22px] font-medium text-primary">
                      {asset.name}
                    </h2>
                    <StatusBadge asset={asset} />
                  </div>
                  <p className="text-[13px] leading-[18px] text-text-muted tabular-nums">
                    참여자 {asset.members.length}명 · 총 {won(asset.totalAmount)}
                  </p>
                  {status.ended && (
                    <p className="text-[13px] leading-[18px] text-text tabular-nums">
                      {withJosa(TERMINATION_LABEL[asset.termination.kind], "으로", "로")} 종료 · {asset.endedAt}
                    </p>
                  )}

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
                    href={action.href}
                    className="relative flex h-8 items-center gap-0.5 self-end text-sm leading-5 font-medium text-primary-strong after:absolute after:-inset-y-1.5 after:inset-x-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                  >
                    {action.label}
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
