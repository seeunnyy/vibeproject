"use client";

import { use, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ContributionCheckBadge } from "@/components/ContributionCheckBadge";
import { MemberTable, type MemberTableRow } from "@/components/MemberTable";
import { NumberInput } from "@/components/NumberInput";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution, computeShares } from "@/lib/calc/shares";
import { sumCostsByPayer } from "@/lib/calc/costs";
import { won } from "@/lib/calc/format";

// S3 자산 상세 — 출처: planning/md-design/03_UX_UI_SPEC.md S3
// 근거: 02_REQUIREMENTS_SPEC.md FR-4, FR-13, R-13.
// 참여자 추가·삭제(아래 "참여자 관리" 섹션): docs/UX_IMPROVEMENT_PROPOSAL.md #4.
export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { assets, mounted, updateAsset, addMember, removeMember } = useAssetStore();
  const asset = assets.find((a) => a.id === id);

  const shares = useMemo(() => (asset ? computeShares(asset) : []), [asset]);
  const contributionCheck = useMemo(
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true, hasNegativeMember: false }),
    [asset],
  );
  const costTotals = useMemo(() => (asset ? sumCostsByPayer(asset) : []), [asset]);

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberContribution, setNewMemberContribution] = useState<number | "">("");

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

  const settlementStarted = !!asset.salePrice && asset.salePrice > 0;
  const trimmedNewMemberName = newMemberName.trim();
  const canAddMember =
    trimmedNewMemberName.length > 0 &&
    (asset.splitMode === "equal" || (newMemberContribution !== "" && newMemberContribution >= 0));

  function handleAddMember(e: FormEvent) {
    e.preventDefault();
    if (!asset || !canAddMember) return;
    addMember(asset.id, {
      name: trimmedNewMemberName,
      contribution: asset.splitMode === "equal" ? 0 : Number(newMemberContribution),
    });
    setNewMemberName("");
    setNewMemberContribution("");
  }

  function removeReason(memberId: string): string | undefined {
    if (!asset) return undefined;
    if (asset.members.length <= 2) return "참여자는 최소 2명이어야 해요";
    if (asset.costs.some((c) => c.payerId === memberId))
      return "이미 낸 비용이 있어 삭제할 수 없어요. 비용을 먼저 삭제하거나 다른 참여자로 재배정해 주세요";
    if (settlementStarted) return "정산이 진행 중이라 삭제할 수 없어요";
    return undefined;
  }

  function handleRemoveMember(memberId: string, memberName: string) {
    if (!asset || removeReason(memberId)) return;
    if (window.confirm(`"${memberName}"님을 참여자에서 삭제할까요?`)) {
      removeMember(asset.id, memberId);
    }
  }

  return (
    <>
      <AppHeader title={asset.name} backHref="/app" />
      {/* 정보 구조: section(제목) → group(테두리 1개 또는 배경 1개) → item(구분선으로만 나눔).
          항목마다 독립 카드를 만들지 않고, 같은 성격끼리 한 그룹으로 묶는다. */}
      <main className="flex flex-1 flex-col gap-8 px-4 py-6">
        <section aria-label="자산 개요" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            {/* 숫자만 크게 두지 않고 무엇의 금액인지 라벨을 먼저 붙인다. 구매일은 보조 정보로 뒤에 둔다. */}
            <p className="text-xs text-text-muted">총 구매금액</p>
            <p className="text-2xl font-semibold tabular-nums">{won(asset.totalAmount)}</p>
            {asset.purchaseDate && <p className="text-xs text-text-muted">구매일 {asset.purchaseDate}</p>}
          </div>
          <ContributionCheckBadge check={contributionCheck} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-text">참여자</h2>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-text-muted">지분·납부액·낸 비용</h3>
            <MemberTable rows={rows} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-text-muted">참여자 관리</h3>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {asset.members.map((member) => {
                const reason = removeReason(member.id);
                return (
                  <li key={member.id} className="flex items-center justify-between gap-3 py-1 pr-2 pl-4 text-sm">
                    <span>{member.name}</span>
                    <button
                      type="button"
                      disabled={!!reason}
                      title={reason}
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="flex min-h-11 shrink-0 items-center rounded-lg px-2 text-xs text-text-muted hover:bg-surface-muted disabled:opacity-30"
                    >
                      삭제
                    </button>
                  </li>
                );
              })}
            </ul>

            <form onSubmit={handleAddMember} className="mt-1 flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="new-member-name" className="sr-only">
                  새 참여자 이름
                </label>
                <input
                  id="new-member-name"
                  className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="새 참여자 이름"
                />
              </div>
              {asset.splitMode === "contribution" && (
                <div className="flex w-32 flex-col gap-1">
                  <label htmlFor="new-member-contribution" className="sr-only">
                    새 참여자 납부액
                  </label>
                  <NumberInput
                    id="new-member-contribution"
                    value={newMemberContribution}
                    onChange={setNewMemberContribution}
                    placeholder="납부액"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={!canAddMember}
                className="flex min-h-11 shrink-0 items-center rounded-lg border border-border px-3 text-sm text-text disabled:opacity-40"
              >
                추가
              </button>
            </form>
            <p className="text-xs text-text-muted">
              참여자를 추가하면 지분이 다시 계산돼요
              {asset.splitMode === "contribution" && ". 납부액 합계가 총 구매금액과 달라지면 위 안내에 다시 표시돼요"}
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-text">자산 정보</h2>
          <div className="flex flex-col gap-2">
            <label htmlFor="manager-select" className="text-sm font-medium text-text-muted">
              관리자
            </label>
            <select
              id="manager-select"
              className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
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
          </div>

          {asset.agreementNote && (
            <div>
              <h3 className="text-sm font-medium text-text-muted">합의 메모</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-text">{asset.agreementNote}</p>
            </div>
          )}
        </section>

        {/* 같은 무게의 테두리 버튼 3개를 반복하지 않고, 하나의 이동 메뉴 그룹으로 묶는다. */}
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-text">다음 단계</h2>
          <nav aria-label="자산 작업" className="divide-y divide-border rounded-xl border border-border">
            <Link
              href={`/app/assets/${asset.id}/costs`}
              className="flex min-h-12 items-center justify-between px-4 text-sm font-medium text-text"
            >
              비용 기록
              <span aria-hidden="true" className="text-text-muted">›</span>
            </Link>
            <Link
              href={`/app/assets/${asset.id}/summary`}
              className="flex min-h-12 items-center justify-between px-4 text-sm font-medium text-text"
            >
              요약 보기
              <span aria-hidden="true" className="text-text-muted">›</span>
            </Link>
            <button
              type="button"
              disabled={!contributionCheck.ok}
              onClick={() => router.push(`/app/assets/${asset.id}/termination`)}
              className="flex min-h-12 w-full items-center justify-between px-4 text-sm font-medium text-text disabled:opacity-40"
            >
              종료·정산
              <span aria-hidden="true" className="text-text-muted">›</span>
            </button>
          </nav>
          {blockedReason && <p className="text-xs text-amber-700">{blockedReason}</p>}
        </section>

        <Link
          href="/app"
          className="flex min-h-11 items-center justify-center text-sm font-medium text-text-muted underline underline-offset-2"
        >
          자산 목록으로 나가기
        </Link>
      </main>
    </>
  );
}
