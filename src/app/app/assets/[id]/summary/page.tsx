"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { MemberTable, type MemberTableRow } from "@/components/MemberTable";
import { SettlementResult } from "@/components/SettlementResult";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution, computeShares } from "@/lib/calc/shares";
import { sumCostsByPayer } from "@/lib/calc/costs";
import { computeSaleSettlement } from "@/lib/calc/settlement";
import { toSummaryText } from "@/lib/storage/assetStore";
import { won } from "@/lib/calc/format";

const COST_TYPE_LABEL: Record<string, string> = {
  repair: "수리비",
  purchase: "추가 구매비",
  shipping: "배송비",
};

// S7 공유 요약 — 출처: planning/md-design/03_UX_UI_SPEC.md S7
// 근거: FR-10, AC-11. 모든 요소는 읽기 전용.
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

  return (
    <>
      <AppHeader title="공유 요약" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
      <main className="flex flex-1 flex-col gap-5 px-4 py-6">
        <section className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-text">{asset.name}</h2>
          {asset.purchaseDate && <p className="text-sm text-text-muted">구매일: {asset.purchaseDate}</p>}
          <p className="text-sm text-text tabular-nums">총 구매금액: {won(asset.totalAmount)}</p>
          <p className="text-sm text-text">관리자: {manager ? manager.name : "미지정"}</p>
        </section>

        {asset.agreementNote && (
          <section>
            <h3 className="text-sm font-medium text-text">합의 메모</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{asset.agreementNote}</p>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-sm font-medium text-text">참여자·지분·비용</h3>
          <MemberTable rows={rows} />
        </section>

        <section>
          <h3 className="mb-2 text-sm font-medium text-text">비용 내역</h3>
          {asset.costs.length === 0 ? (
            <p className="text-sm text-text-muted">기록된 비용이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm text-text-muted">
              {asset.costs.map((cost) => (
                <li key={cost.id} className="tabular-nums">
                  {cost.date} {COST_TYPE_LABEL[cost.type]} {won(cost.amount)} (부담자:{" "}
                  {asset.members.find((m) => m.id === cost.payerId)?.name ?? "알 수 없음"})
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-medium text-text">종료·정산</h3>
          <p className="text-sm text-text-muted">종료 규칙: 매각</p>
          {asset.terminationNote && <p className="mt-1 text-sm text-text-muted">종료 합의 메모: {asset.terminationNote}</p>}
          {settlement ? (
            <div className="mt-2">
              <SettlementResult result={settlement} members={asset.members} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-muted">
              <Link href={`/app/assets/${asset.id}/settlement`} className="text-primary-strong underline">
                매각가를 입력하면 정산 결과가 표시됩니다
              </Link>
            </p>
          )}
        </section>

        <button
          type="button"
          onClick={handleCopy}
          className="flex min-h-11 items-center justify-center rounded-xl bg-primary-strong px-4 text-sm font-medium text-white"
        >
          요약 복사
        </button>
        {copied && <p role="status" className="text-xs text-green-700">복사됨</p>}
      </main>
    </>
  );
}
