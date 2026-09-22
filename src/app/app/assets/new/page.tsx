"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { FormField } from "@/components/FormField";
import { NumberInput } from "@/components/NumberInput";
import { ContributionCheckBadge } from "@/components/ContributionCheckBadge";
import { FormulaText } from "@/components/FormulaText";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution, computeShares } from "@/lib/calc/shares";
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

  const trimmedName = name.trim();
  const validMembers = members.filter((m) => m.name.trim().length > 0);
  const hasEnoughMembers = validMembers.length >= 2 && validMembers.length === members.length;
  const totalValid = numericTotal > 0;
  const contributionsFilled =
    splitMode === "equal" || members.every((m) => m.contribution.trim() !== "");
  const contributionSumOk = splitMode === "equal" || contributionCheck.sum > 0;

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

  return (
    <>
      <AppHeader title="자산 만들기" backHref="/app" />
      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <FormField label="물건명" htmlFor="asset-name" required>
            <input
              id="asset-name"
              className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 공용 냉장고"
            />
          </FormField>

          <FormField label="구매일" htmlFor="asset-purchase-date">
            <input
              id="asset-purchase-date"
              type="date"
              className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
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
            <NumberInput id="asset-total" value={totalAmount} onChange={setTotalAmount} min={0} placeholder="900000" />
          </FormField>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-text">분배 방식</legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSplitMode("contribution")}
                aria-pressed={splitMode === "contribution"}
                className={`flex min-h-11 items-center rounded-xl border px-3 text-sm ${
                  splitMode === "contribution" ? "border-primary-strong bg-primary-strong text-white" : "border-border text-text"
                }`}
              >
                납부액 입력
              </button>
              <button
                type="button"
                onClick={() => setSplitMode("equal")}
                aria-pressed={splitMode === "equal"}
                className={`flex min-h-11 items-center rounded-xl border px-3 text-sm ${
                  splitMode === "equal" ? "border-primary-strong bg-primary-strong text-white" : "border-border text-text"
                }`}
              >
                균등 분할
              </button>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-text">참여자 (최소 2명) *</legend>
            {members.map((member, index) => (
              <div key={member.tempId} className="flex items-start gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor={`member-name-${member.tempId}`} className="sr-only">
                    참여자 {index + 1} 이름
                  </label>
                  <input
                    id={`member-name-${member.tempId}`}
                    className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
                    value={member.name}
                    onChange={(e) => updateMember(member.tempId, { name: e.target.value })}
                    placeholder={`참여자 ${index + 1} 이름`}
                  />
                </div>
                {splitMode === "contribution" && (
                  <div className="flex w-32 flex-col gap-1">
                    <label htmlFor={`member-contribution-${member.tempId}`} className="sr-only">
                      {member.name || `참여자 ${index + 1}`} 납부액
                    </label>
                    <input
                      id={`member-contribution-${member.tempId}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
                      value={member.contribution}
                      onChange={(e) => updateMember(member.tempId, { contribution: e.target.value })}
                      placeholder="납부액"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeMember(member.tempId)}
                  disabled={members.length <= 2}
                  className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs text-text-muted hover:bg-surface-muted disabled:opacity-30"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMember}
              className="flex min-h-11 items-center self-start rounded-xl border border-border px-3 text-sm text-text"
            >
              참여자 추가
            </button>
          </fieldset>

          {shares.length > 0 && (splitMode === "equal" || shares.some((s) => s.sharePct > 0)) && (
            <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface-muted p-3">
              <p className="text-sm font-medium text-text">지분 미리보기</p>
              <ul className="flex flex-col gap-1 text-sm text-text-muted">
                {shares.map((share) => {
                  const member = members.find((m) => m.tempId === share.memberId);
                  return (
                    <li key={share.memberId} className="tabular-nums">
                      {member?.name || "(이름 없음)"}: {share.sharePct.toFixed(1)}% <FormulaText expr={share.formula} />
                    </li>
                  );
                })}
              </ul>
              {splitMode === "contribution" && <ContributionCheckBadge check={contributionCheck} />}
            </div>
          )}

          <FormField label="관리자" htmlFor="asset-manager" hint="자산을 실제로 보관·관리할 참여자 (선택)">
            <select
              id="asset-manager"
              className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
              value={managerTempId}
              onChange={(e) => setManagerTempId(e.target.value)}
            >
              <option value="">없음</option>
              {members
                .filter((m) => m.name.trim().length > 0)
                .map((m) => (
                  <option key={m.tempId} value={m.tempId}>
                    {m.name}
                  </option>
                ))}
            </select>
          </FormField>

          <FormField label="합의 메모" htmlFor="asset-agreement-note" hint="구매 시 합의한 내용 (선택)">
            <textarea
              id="asset-agreement-note"
              className="min-h-20 rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
              value={agreementNote}
              onChange={(e) => setAgreementNote(e.target.value)}
            />
          </FormField>

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex min-h-11 items-center justify-center rounded-xl bg-primary-strong px-4 text-sm font-medium text-white disabled:opacity-40"
          >
            자산 만들기
          </button>
          {!canSubmit && (
            <p className="text-xs text-text-muted">
              물건명, 총 구매금액(0보다 큼), 참여자 2명 이상{splitMode === "contribution" ? ", 전원의 납부액" : ""}을
              입력하면 만들 수 있어요.
            </p>
          )}
        </form>
      </main>
    </>
  );
}
