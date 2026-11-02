"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { StatusScreen } from "@/components/StatusScreen";
import { BottomBar, Button } from "@/components/Button";
import { SectionHeader } from "@/components/Section";
import { MemberTable, type MemberTableRow } from "@/components/MemberTable";
import { SettlementResult } from "@/components/SettlementResult";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution, computeShares } from "@/lib/calc/shares";
import { sumCostsByPayer } from "@/lib/calc/costs";
import { computeSaleSettlement } from "@/lib/calc/settlement";
import { toSummaryText } from "@/lib/storage/assetStore";
import { won } from "@/lib/calc/format";
import { TERMINATION_LABEL } from "@/lib/labels";

const COST_TYPE_LABEL: Record<string, string> = {
  repair: "수리비",
  purchase: "추가 구매비",
  shipping: "배송비",
};

// S7 공유 요약 — 출처: planning/md-design/03_UX_UI_SPEC.md S7
// 근거: FR-10, AC-11. 모든 요소는 읽기 전용.
// 시각: Figma "07 공유 요약" — 20px 자산명 + 회색 정보 카드, 합의 메모 텍스트, 참여자·지분/비용 내역 회색 카드(구분선),
// 파란 정산 결과 카드, 하단 고정 남색 "요약 복사".
export default function SummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assets, mounted } = useAssetStore();
  const asset = assets.find((a) => a.id === id);
  const [copied, setCopied] = useState(false);

  const shares = useMemo(() => (asset ? computeShares(asset) : []), [asset]);
  const contributionCheck = useMemo(
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true, hasNegativeMember: false }),
    [asset],
  );
  const costTotals = useMemo(() => (asset ? sumCostsByPayer(asset) : []), [asset]);
  const settlement = useMemo(() => (asset ? computeSaleSettlement(asset) : null), [asset]);

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="공유 요약" backHref="/app" />
        <StatusScreen message="해당 자산을 찾을 수 없어요." actionLabel="목록으로 돌아가기" href="/app" />
      </>
    );
  }

  if (!asset) {
    return (
      <>
        <AppHeader title="공유 요약" backHref="/app" />
        <main className="flex-1" />
      </>
    );
  }

  const manager = asset.members.find((m) => m.id === asset.managerId);
  const rows: MemberTableRow[] = asset.members.map((member) => {
    const share = shares.find((s) => s.memberId === member.id);
    const paidTotal = costTotals.find((c) => c.memberId === member.id)?.paidTotal ?? 0;
    return {
      member,
      sharePct: share?.sharePct ?? 0,
      formula: share?.formula ?? "",
      paidTotal,
      isManager: asset.managerId === member.id,
    };
  });

  async function handleCopy() {
    if (!asset) return;
    const text = toSummaryText(asset, { shares, contribution: contributionCheck, costTotals, settlement });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("아래 내용을 복사해 주세요", text);
    }
  }

  const infoRows = [
    ...(asset.purchaseDate ? [{ label: "구매일", value: asset.purchaseDate }] : []),
    { label: "총 구매금액", value: won(asset.totalAmount) },
    { label: "관리자", value: manager ? manager.name : "미지정" },
    { label: "종료 규칙", value: TERMINATION_LABEL[asset.termination.kind] },
    ...(asset.endedAt ? [{ label: "종료일", value: asset.endedAt }] : []),
  ];
  const isSale = asset.termination.kind === "sale";

  return (
    <>
      <AppHeader title="공유 요약" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
      <main className="flex flex-1 flex-col gap-8 px-5 pt-2 pb-8">
        <section className="flex flex-col gap-3.5">
          <h2 className="text-xl leading-7 font-bold tracking-[-0.01em] text-primary">{asset.name}</h2>
          <dl className="flex flex-col gap-2.5 rounded-2xl bg-surface-muted p-4 tabular-nums">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-center">
                <dt className="flex-1 text-[13px] leading-[18px] text-text-muted">{row.label}</dt>
                <dd className="text-sm leading-5 font-medium text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {asset.agreementNote && (
          <section className="flex flex-col gap-2">
            <SectionHeader title="합의 메모" />
            <p className="text-[15px] leading-[22px] whitespace-pre-wrap text-text">{asset.agreementNote}</p>
          </section>
        )}

        {asset.terminationNote && (
          <section className="flex flex-col gap-2">
            <SectionHeader title="종료 합의 메모" />
            <p className="text-[15px] leading-[22px] whitespace-pre-wrap text-text">{asset.terminationNote}</p>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <SectionHeader title="참여자·지분" aside={`${asset.members.length}명`} />
          <MemberTable rows={rows} grouped showManager={false} />
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader title="비용 내역" aside={`${asset.costs.length}건`} />
          {asset.costs.length === 0 ? (
            <p className="text-[13px] leading-[18px] text-text-muted">기록된 비용이 없습니다.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-2xl bg-surface-muted px-4 py-1">
              {asset.costs.map((cost) => (
                <li key={cost.id} className="flex flex-col gap-0.5 py-3 tabular-nums">
                  <p className="flex items-center text-sm leading-5 font-medium text-primary">
                    <span className="flex-1">{COST_TYPE_LABEL[cost.type]}</span>
                    <span>{won(cost.amount)}</span>
                  </p>
                  <p className="text-[13px] leading-[18px] text-text-muted">
                    {cost.date} · 부담자 {asset.members.find((m) => m.id === cost.payerId)?.name ?? "알 수 없음"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 인수·폐기는 앱에서 금액을 계산하지 않으므로 정산 결과 섹션을 두지 않는다. */}
        {isSale && (
          <section className="flex flex-col gap-3">
            <SectionHeader
              title="정산 결과"
              aside={settlement ? `매각가 ${won(settlement.salePrice)}` : undefined}
            />
            {settlement ? (
              <SettlementResult result={settlement} members={asset.members} title="" checkGap="gap-3" />
            ) : (
              <Link
                href={`/app/assets/${asset.id}/settlement`}
                className="flex min-h-11 items-center gap-0.5 self-start text-sm leading-5 font-medium text-primary-strong"
              >
                매각가를 입력하면 정산 결과가 표시됩니다
              </Link>
            )}
          </section>
        )}
      </main>
      <BottomBar>
        {copied && (
          <p role="status" className="text-center text-xs leading-4 text-success">
            복사됨
          </p>
        )}
        <Button onClick={handleCopy}>요약 복사</Button>
      </BottomBar>
    </>
  );
}
