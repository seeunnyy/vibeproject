"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Avatar } from "@/components/Avatar";
import { BottomBar, Button } from "@/components/Button";
import { chipClassName } from "@/components/Chip";
import { ContributionCheckBadge } from "@/components/ContributionCheckBadge";
import { FormField, Select, inputClassName, textareaClassName } from "@/components/FormField";
import { HighlightCard } from "@/components/HighlightCard";
import { Icon } from "@/components/Icon";
import { NumberInput } from "@/components/NumberInput";
import { SectionHeader } from "@/components/Section";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution, computeEqualBurdens, computeShares } from "@/lib/calc/shares";
import { comma, won } from "@/lib/calc/format";
import type { Asset, SplitMode } from "@/lib/types";

// S2 자산 생성 — 출처: planning/md-design/03_UX_UI_SPEC.md S2
// 근거: 02_REQUIREMENTS_SPEC.md FR-1/FR-2/FR-3/FR-13, R-9, R-11, R-13.

interface MemberDraft {
  tempId: string;
  name: string;
  contribution: string; // 입력값을 문자열로 들고 있다가 제출 시 숫자로 변환("입력 여부" 자체가 검증 대상)
}

function buildPreviewAsset(
  totalAmount: number,
  splitMode: SplitMode,
  members: MemberDraft[],
): Asset {
  return {
    id: "preview",
    name: "",
    totalAmount,
    splitMode,
    members: members.map((m) => ({
      id: m.tempId,
      name: m.name,
      contribution: splitMode === "equal" ? 0 : Number(m.contribution) || 0,
    })),
    costs: [],
    termination: { kind: "sale" },
    status: "draft",
    createdAt: "",
    updatedAt: "",
  };
}

function nextTempId(): string {
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function NewAssetPage() {
  const router = useRouter();
  const { createAsset } = useAssetStore();

  const [name, setName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [splitMode, setSplitMode] = useState<SplitMode>("contribution");
  // 고정 tempId: nextTempId()(Date.now()/Math.random() 기반)를 초기 state에 그대로 쓰면
  // 서버 렌더와 클라이언트 하이드레이션에서 값이 달라져 id/htmlFor가 어긋난다(hydration mismatch).
  // 이후 추가되는 행(addMember)은 클라이언트 이벤트에서만 생성되므로 영향 없음.
  const [members, setMembers] = useState<MemberDraft[]>([
    { tempId: "initial-1", name: "", contribution: "" },
    { tempId: "initial-2", name: "", contribution: "" },
  ]);
  const [managerTempId, setManagerTempId] = useState<string>("");
  const [agreementNote, setAgreementNote] = useState("");

  const numericTotal = totalAmount === "" ? 0 : totalAmount;

  const previewAsset = useMemo(
    () => buildPreviewAsset(numericTotal, splitMode, members),
    [numericTotal, splitMode, members],
  );
  const shares = useMemo(() => computeShares(previewAsset), [previewAsset]);
  const contributionCheck = useMemo(() => checkContribution(previewAsset), [previewAsset]);
  const equalBurdens = useMemo(
    () => (splitMode === "equal" ? computeEqualBurdens(previewAsset) : []),
    [splitMode, previewAsset],
  );

  const trimmedName = name.trim();
  const validMembers = members.filter((m) => m.name.trim().length > 0);
  const hasEnoughMembers = validMembers.length >= 2 && validMembers.length === members.length;
  const totalValid = numericTotal > 0;
  const contributionsFilled =
    splitMode === "equal" || members.every((m) => m.contribution.trim() !== "");
  // 종료·정산 단계와 동일한 기준(checkContribution.ok)을 그대로 재사용한다.
  // 이전에는 "합계 > 0"만 확인해 생성 시점과 종료 시점의 검증 기준이 서로 달랐다
  // (합계 불일치·개별 음수 납부액도 생성은 통과되던 문제) — docs/UX_IMPROVEMENT_PROPOSAL.md #2.
  const contributionSumOk = splitMode === "equal" || contributionCheck.ok;

  const canSubmit =
    trimmedName.length > 0 && totalValid && hasEnoughMembers && contributionsFilled && contributionSumOk;

  function updateMember(tempId: string, patch: Partial<MemberDraft>) {
    setMembers((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, ...patch } : m)));
  }

  function addMember() {
    setMembers((prev) => [...prev, { tempId: nextTempId(), name: "", contribution: "" }]);
  }

  function removeMember(tempId: string) {
    setMembers((prev) => {
      const next = prev.filter((m) => m.tempId !== tempId);
      return next;
    });
    if (managerTempId === tempId) setManagerTempId("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const newId = createAsset({
      name: trimmedName,
      purchaseDate: purchaseDate || undefined,
      totalAmount: numericTotal,
      splitMode,
      members: members.map((m) => ({
        tempId: m.tempId,
        name: m.name.trim(),
        contribution: splitMode === "equal" ? 0 : Number(m.contribution) || 0,
      })),
      managerTempId: managerTempId || undefined,
      agreementNote: agreementNote || undefined,
    });
    router.push(`/app/assets/${newId}`);
  }

  const previewAside =
    splitMode === "equal" ? "총 구매금액 ÷ 참여자 수" : contributionCheck.ok ? "납부액 ÷ 총 구매금액" : "납부액 ÷ 납부액 합계";

  return (
    <>
      <AppHeader title="자산 만들기" backHref="/app" />
      {/* 시각: Figma "02 자산 만들기" — 기본 정보 / 참여자와 지분 / 추가 정보 세 섹션(간격 36px),
          회색 입력칸, pill 칩, 파란 지분 미리보기 카드, 하단 고정 남색 "자산 만들기". */}
      <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
        <main className="flex flex-1 flex-col gap-9 px-5 pt-3 pb-8">
          <section className="flex flex-col gap-4">
            <SectionHeader title="기본 정보" />
            <FormField label="물건명" htmlFor="asset-name" required>
              <input
                id="asset-name"
                className={inputClassName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 공용 냉장고"
              />
            </FormField>

            <FormField label="구매일" htmlFor="asset-purchase-date">
              <input
                id="asset-purchase-date"
                type="date"
                className={inputClassName}
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </FormField>

            <FormField
              label="총 구매금액"
              htmlFor="asset-total"
              required
              error={totalAmount !== "" && !totalValid ? "0보다 큰 금액을 입력해 주세요" : undefined}
            >
              <NumberInput id="asset-total" value={totalAmount} onChange={setTotalAmount} min={0} placeholder="900,000" />
            </FormField>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader title="참여자와 지분" />
            <fieldset className="flex flex-col">
              <legend className="mb-2 text-sm leading-5 font-medium text-text">분배 방식</legend>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSplitMode("contribution")}
                  aria-pressed={splitMode === "contribution"}
                  className={chipClassName(splitMode === "contribution")}
                >
                  납부액 입력
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode("equal")}
                  aria-pressed={splitMode === "equal"}
                  className={chipClassName(splitMode === "equal")}
                >
                  균등 분할
                </button>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 text-sm leading-5 font-medium text-text">참여자 (최소 2명) *</legend>
              <div className="flex flex-col gap-2">
                {members.map((member, index) => (
                  <div key={member.tempId} className="flex items-center gap-2">
                    <Avatar name={member.name} text={member.name.trim() ? undefined : String(index + 1)} />
                    <label htmlFor={`member-name-${member.tempId}`} className="sr-only">
                      참여자 {index + 1} 이름
                    </label>
                    <input
                      id={`member-name-${member.tempId}`}
                      className={`${inputClassName} min-w-0 flex-1 px-3.5`}
                      value={member.name}
                      onChange={(e) => updateMember(member.tempId, { name: e.target.value })}
                      placeholder={`참여자 ${index + 1} 이름`}
                    />
                    {splitMode === "contribution" && (
                      <>
                        <label htmlFor={`member-contribution-${member.tempId}`} className="sr-only">
                          {member.name || `참여자 ${index + 1}`} 납부액
                        </label>
                        <NumberInput
                          id={`member-contribution-${member.tempId}`}
                          value={member.contribution === "" ? "" : Number(member.contribution)}
                          onChange={(value) => updateMember(member.tempId, { contribution: String(value) })}
                          placeholder="납부액"
                          align="right"
                          className="w-[124px] shrink-0 gap-1 px-3.5"
                        />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMember(member.tempId)}
                      disabled={members.length <= 2}
                      aria-label={`${member.name || `참여자 ${index + 1}`} 삭제`}
                      className="flex min-h-11 shrink-0 items-center px-1 text-[13px] leading-[18px] text-text-muted disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addMember}
                className="flex min-h-11 items-center gap-1.5 self-start rounded-full border border-border px-4 text-sm leading-5 font-medium text-primary focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                <Icon name="plus" size={18} />
                참여자 추가
              </button>
            </fieldset>

            {shares.length > 0 && (splitMode === "equal" || shares.some((s) => s.sharePct > 0)) && (
              <>
                <HighlightCard
                  title="지분 미리보기"
                  aside={previewAside}
                  rows={shares.map((share) => {
                    const member = members.find((m) => m.tempId === share.memberId);
                    return {
                      key: share.memberId,
                      label: member?.name || "(이름 없음)",
                      value: `${share.sharePct.toFixed(1)}%`,
                      // 균등 분할: 지분율 아래 줄을 "450,000 ÷ 2 = 225,000원"(총 구매금액 ÷ 참여자 수 = 부담액)으로.
                      sub:
                        splitMode === "equal"
                          ? `${comma(numericTotal)} ÷ ${members.length} = ${won(
                              equalBurdens.find((b) => b.memberId === share.memberId)?.burden ?? 0,
                            )}`
                          : share.formula,
                    };
                  })}
                />
                {splitMode === "contribution" && <ContributionCheckBadge check={contributionCheck} />}
              </>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader title="추가 정보 (선택)" />
            <FormField label="관리자" htmlFor="asset-manager">
              <Select id="asset-manager" value={managerTempId} onChange={(e) => setManagerTempId(e.target.value)}>
                <option value="">없음</option>
                {members
                  .filter((m) => m.name.trim().length > 0)
                  .map((m) => (
                    <option key={m.tempId} value={m.tempId}>
                      {m.name}
                    </option>
                  ))}
              </Select>
            </FormField>

            <FormField label="합의 메모" htmlFor="asset-agreement-note">
              <textarea
                id="asset-agreement-note"
                className={`${textareaClassName} mt-2`}
                value={agreementNote}
                onChange={(e) => setAgreementNote(e.target.value)}
              />
            </FormField>
          </section>
        </main>

        <BottomBar>
          <Button type="submit" disabled={!canSubmit}>
            자산 만들기
          </Button>
        </BottomBar>
      </form>
    </>
  );
}
