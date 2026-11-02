"use client";

import { use, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { ContributionCheckBadge } from "@/components/ContributionCheckBadge";
import { FormField, Select, inputClassName } from "@/components/FormField";
import { Icon } from "@/components/Icon";
import { MemberTable, type MemberTableRow } from "@/components/MemberTable";
import { NextStepCard } from "@/components/NextStepCard";
import { NumberInput } from "@/components/NumberInput";
import { SectionHeader } from "@/components/Section";
import { StepTimeline, type TimelineStep } from "@/components/StepTimeline";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution, computeShares } from "@/lib/calc/shares";
import { sumCostsByPayer } from "@/lib/calc/costs";
import { won } from "@/lib/calc/format";

// S3 자산 상세 — 출처: planning/md-design/03_UX_UI_SPEC.md S3
// 근거: 02_REQUIREMENTS_SPEC.md FR-4, FR-13, R-13.
// 참여자 추가·삭제(아래 "참여자 관리" 섹션): docs/UX_IMPROVEMENT_PROPOSAL.md #4.
// 시각: Figma "03 자산 상세" — 큰 금액 개요, 참여자 회색 카드, 자산 정보, 맨 아래 "이 자산 삭제"(목록에서 옮김).
// 시안에 없던 "다음 할 일" 파란 카드와 "진행 단계" 타임라인은 시안의 파란 강조 카드 · 09 설정 번호 레일을
// 재사용해 추가했다(예전 "다음 단계" 메뉴 3개를 대체). 참여자 관리는 "참여자 추가·삭제" 링크 뒤로 접어 둔다.
export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { assets, mounted, updateAsset, addMember, removeMember, deleteAsset } = useAssetStore();
  const asset = assets.find((a) => a.id === id);

  const shares = useMemo(() => (asset ? computeShares(asset) : []), [asset]);
  const contributionCheck = useMemo(
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true, hasNegativeMember: false }),
    [asset],
  );
  const costTotals = useMemo(() => (asset ? sumCostsByPayer(asset) : []), [asset]);

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberContribution, setNewMemberContribution] = useState<number | "">("");
  const [managing, setManaging] = useState(false);

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

  const costTotal = asset.costs.reduce((sum, cost) => sum + cost.amount, 0);

  function openMemberManagement() {
    setManaging(true);
    requestAnimationFrame(() => {
      document.getElementById("member-management")?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("new-member-name")?.focus({ preventScroll: true });
    });
  }

  function handleDeleteAsset() {
    if (!asset) return;
    if (window.confirm(`"${asset.name}"을(를) 삭제할까요? 되돌릴 수 없습니다.`)) {
      router.replace("/app");
      deleteAsset(asset.id);
    }
  }

  // 진행 단계: 등록 → 비용 기록(선택) → 종료·정산 → 공유 요약. 계산 로직은 건드리지 않고
  // 기존 판정값(contributionCheck.ok, salePrice, costs)만 읽어 상태를 표시한다.
  const steps: TimelineStep[] = [
    {
      title: "자산 등록",
      desc: contributionCheck.ok
        ? `참여자 ${asset.members.length}명 · 총 ${won(asset.totalAmount)}`
        : "납부액 합계가 총 구매금액과 달라요",
      state: contributionCheck.ok ? "done" : "current",
    },
    {
      title: "비용 기록",
      desc:
        asset.costs.length > 0
          ? `${asset.costs.length}건 · 합계 ${won(costTotal)}`
          : "수리비·배송비처럼 추가로 든 비용이 있으면 남겨요 (선택)",
      state: asset.costs.length > 0 ? "done" : "todo",
      href: `/app/assets/${asset.id}/costs`,
    },
    {
      title: "종료·정산",
      desc: settlementStarted
        ? `매각가 ${won(asset.salePrice ?? 0)}로 정산했어요`
        : contributionCheck.ok
          ? "종료 규칙을 정하고 매각가를 입력해 정산해요"
          : "납부액 합계가 맞아야 진행할 수 있어요",
      state: !contributionCheck.ok ? "locked" : settlementStarted ? "done" : "current",
      href: `/app/assets/${asset.id}/termination`,
    },
    {
      title: "요약 보기",
      desc: "지분·비용·정산 결과를 한 번에 보고 복사해요",
      state: settlementStarted ? "current" : "todo",
      href: `/app/assets/${asset.id}/summary`,
    },
  ];

  const nextStep = !contributionCheck.ok
    ? {
        title: "납부액 합계를 맞춰 주세요",
        desc: "납부액 합계가 총 구매금액과 달라 종료·정산을 진행할 수 없어요. 참여자를 확인해 주세요.",
        actionLabel: "참여자 추가·삭제",
        onAction: openMemberManagement,
      }
    : !settlementStarted
      ? {
          title: "종료 규칙을 정하고 정산해요",
          desc: "공동소유를 어떻게 끝낼지 정하고, 매각가를 입력하면 지분대로 나눠 드려요.",
          actionLabel: "종료·정산",
          href: `/app/assets/${asset.id}/termination`,
        }
      : {
          title: "정산 결과를 공유해요",
          desc: "참여자들에게 지분과 받을 금액을 요약해서 보내 보세요.",
          actionLabel: "요약 보기",
          href: `/app/assets/${asset.id}/summary`,
        };

  return (
    <>
      <AppHeader title={asset.name} backHref="/app" />
      <main className="flex flex-1 flex-col gap-9 px-5 pt-2 pb-10">
        <section aria-label="자산 개요" className="flex flex-col gap-1">
          {/* 숫자만 크게 두지 않고 무엇의 금액인지 라벨을 먼저 붙인다. */}
          <p className="text-[13px] leading-[18px] font-medium text-text-muted">총 구매금액</p>
          <p className="text-[28px] leading-9 font-bold tracking-[-0.02em] text-primary tabular-nums">
            {won(asset.totalAmount)}
          </p>
          <p className="text-[13px] leading-[18px] text-text-muted tabular-nums">
            {asset.purchaseDate && <>구매일 {asset.purchaseDate} · </>}
            {manager ? `관리자 ${manager.name}` : "관리자 미지정"}
          </p>
          <div className="pt-2">
            <ContributionCheckBadge check={contributionCheck} />
          </div>
        </section>

        <NextStepCard {...nextStep} />

        <section className="flex flex-col gap-4">
          <SectionHeader title="진행 단계" />
          <StepTimeline steps={steps} label="진행 단계" />
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader title="참여자" aside={`${asset.members.length}명`} />
          <MemberTable rows={rows} />

          <button
            type="button"
            aria-expanded={managing}
            aria-controls="member-management"
            onClick={() => setManaging((v) => !v)}
            className="flex min-h-11 items-center gap-0.5 self-start text-sm leading-5 font-medium text-primary-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            참여자 추가·삭제
            <Icon name={managing ? "chevron-down" : "chevron-right"} size={18} />
          </button>

          {managing && (
            <div id="member-management" className="flex scroll-mt-20 flex-col gap-3">
              <ul className="flex flex-col divide-y divide-border rounded-2xl bg-surface-muted px-4">
                {asset.members.map((member) => {
                  const reason = removeReason(member.id);
                  return (
                    <li key={member.id} className="flex flex-col py-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[15px] leading-[22px] text-text">{member.name}</span>
                        <button
                          type="button"
                          disabled={!!reason}
                          aria-describedby={reason ? `remove-reason-${member.id}` : undefined}
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="flex min-h-11 shrink-0 items-center px-1 text-[13px] leading-[18px] text-error disabled:text-text-muted disabled:opacity-60"
                        >
                          삭제
                        </button>
                      </div>
                      {reason && (
                        <p id={`remove-reason-${member.id}`} className="pb-2 text-xs leading-4 text-text-muted">
                          {reason}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>

              <form onSubmit={handleAddMember} className="flex items-center gap-2">
                <label htmlFor="new-member-name" className="sr-only">
                  새 참여자 이름
                </label>
                <input
                  id="new-member-name"
                  className={`${inputClassName} min-w-0 flex-1 px-3.5`}
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="새 참여자 이름"
                />
                {asset.splitMode === "contribution" && (
                  <>
                    <label htmlFor="new-member-contribution" className="sr-only">
                      새 참여자 납부액
                    </label>
                    <NumberInput
                      id="new-member-contribution"
                      value={newMemberContribution}
                      onChange={setNewMemberContribution}
                      placeholder="납부액"
                      align="right"
                      className="w-[124px] shrink-0 gap-1 px-3.5"
                    />
                  </>
                )}
                <button
                  type="submit"
                  disabled={!canAddMember}
                  className="flex min-h-11 shrink-0 items-center rounded-full border border-border px-4 text-sm leading-5 font-medium text-primary disabled:text-text-muted disabled:opacity-60"
                >
                  추가
                </button>
              </form>
              <p className="text-xs leading-4 text-text-muted">
                참여자를 추가하면 지분이 다시 계산돼요
                {asset.splitMode === "contribution" && ". 납부액 합계가 총 구매금액과 달라지면 위 안내에 다시 표시돼요"}
              </p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader title="자산 정보" />
          <FormField label="관리자" htmlFor="manager-select">
            <Select
              id="manager-select"
              value={asset.managerId ?? ""}
              onChange={(e) => updateAsset(asset.id, { managerId: e.target.value || undefined })}
            >
              <option value="">관리자 미지정</option>
              {asset.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </FormField>

          {asset.agreementNote && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm leading-5 font-medium text-text">합의 메모</h3>
              <p className="rounded-2xl bg-surface-muted px-4 py-3.5 text-[15px] leading-[22px] whitespace-pre-wrap text-text">
                {asset.agreementNote}
              </p>
            </div>
          )}
        </section>

        <div className="flex flex-col items-center gap-2">
          <Button variant="danger" onClick={handleDeleteAsset} className="w-full">
            이 자산 삭제
          </Button>
          <Link
            href="/app"
            className="flex min-h-11 items-center text-sm leading-5 font-medium text-text-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            자산 목록으로 나가기
          </Link>
        </div>
      </main>
    </>
  );
}
