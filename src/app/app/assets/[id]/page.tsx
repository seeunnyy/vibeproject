"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ContributionCheckBadge } from "@/components/ContributionCheckBadge";
import { MemberTable, type MemberTableRow } from "@/components/MemberTable";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution, computeShares } from "@/lib/calc/shares";
import { sumCostsByPayer } from "@/lib/calc/costs";
import { won } from "@/lib/calc/format";

// S3 자산 상세 — 출처: planning/md-design/03_UX_UI_SPEC.md S3
// 근거: 02_REQUIREMENTS_SPEC.md FR-4, FR-13, R-13.
export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { assets, mounted, updateAsset } = useAssetStore();
  const asset = assets.find((a) => a.id === id);

  const shares = useMemo(() => (asset ? computeShares(asset) : []), [asset]);
  const contributionCheck = useMemo(
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true }),
    [asset],
  );
  const costTotals = useMemo(() => (asset ? sumCostsByPayer(asset) : []), [asset]);

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="자산 상세" backHref="/app" />
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
        <AppHeader title="자산 상세" backHref="/app" />
        <main className="flex-1" />
      </>
    );
  }

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

  const manager = asset.members.find((m) => m.id === asset.managerId);
  const blockedReason = !contributionCheck.ok
    ? "납부액 합계가 총 구매금액과 달라 진행할 수 없어요. 자산 상세에서 참여자 납부액을 확인해 주세요."
    : undefined;

  return (
    <>
      <AppHeader title={asset.name} backHref="/app" />
      <main className="flex flex-1 flex-col gap-5 px-4 py-6">
        <section className="flex flex-col gap-1">
          {asset.purchaseDate && <p className="text-sm text-text-muted">구매일: {asset.purchaseDate}</p>}
          <p className="text-lg font-semibold tabular-nums">{won(asset.totalAmount)}</p>
        </section>

        <ContributionCheckBadge check={contributionCheck} />

        <section className="flex flex-col gap-2">
          <label htmlFor="manager-select" className="text-sm font-medium text-text">
            관리자
          </label>
          <select
            id="manager-select"
            className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
            value={asset.managerId ?? ""}
            onChange={(e) => updateAsset(asset.id, { managerId: e.target.value || undefined })}
          >
            <option value="">관리자 미지정</option>
            {asset.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {manager ? (
            <p className="text-xs text-text-muted">현재 관리자: {manager.name}</p>
          ) : (
            <p className="text-xs text-text-muted">관리자 미지정</p>
          )}
        </section>

        {asset.agreementNote && (
          <section>
            <h2 className="text-sm font-medium text-text">합의 메모</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{asset.agreementNote}</p>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-medium text-text">참여자별 지분·납부액·낸 비용</h2>
          <MemberTable rows={rows} />
        </section>

        <section className="flex flex-col gap-2">
          <Link
            href={`/app/assets/${asset.id}/costs`}
            className="flex min-h-11 items-center justify-center rounded-xl border border-border text-center text-sm font-medium text-text"
          >
            비용 기록
          </Link>
          <button
            type="button"
            disabled={!contributionCheck.ok}
            onClick={() => router.push(`/app/assets/${asset.id}/termination`)}
            className="flex min-h-11 items-center justify-center rounded-xl border border-border text-center text-sm font-medium text-text disabled:opacity-40"
          >
            종료·정산
          </button>
          {blockedReason && <p className="text-xs text-amber-700">{blockedReason}</p>}
          <Link
            href={`/app/assets/${asset.id}/summary`}
            className="flex min-h-11 items-center justify-center rounded-xl border border-border text-center text-sm font-medium text-text"
          >
            요약 보기
          </Link>
        </section>
      </main>
    </>
  );
}
