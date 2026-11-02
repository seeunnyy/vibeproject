"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BottomBar, Button } from "@/components/Button";
import { textareaClassName } from "@/components/FormField";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";

// S5 종료 규칙 — 출처: planning/md-design/03_UX_UI_SPEC.md S5
// 근거: FR-7. MVP는 매각만 활성, 인수·폐기는 "다음 버전" 표시(02 부록 A).
// 시각: Figma "05 종료 규칙" — 20px 질문 제목, 선택지 카드(선택: primary-soft + 1.5px 파란 테두리 + 라디오,
// 비활성: 흰 배경 + 테두리, 55% 투명), 회색 메모 입력, 하단 고정 남색 "저장하고 정산으로 이동".
// 선택지는 실제 radio input(시각적으로 숨김)으로 두어 스크린리더가 "선택됨/사용 불가"를 그대로 읽게 한다.
export default function TerminationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { assets, mounted, updateAsset } = useAssetStore();
  const asset = assets.find((a) => a.id === id);
  const [note, setNote] = useState(asset?.terminationNote ?? "");
  const [saved, setSaved] = useState(false);

  const contributionCheck = useMemo(
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true, hasNegativeMember: false }),
    [asset],
  );

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="종료 규칙" backHref="/app" />
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
        <AppHeader title="종료 규칙" backHref="/app" />
        <main className="flex-1" />
      </>
    );
  }

  if (!contributionCheck.ok) {
    return (
      <>
        <AppHeader title="종료 규칙" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-error">
            납부액 합계가 총 구매금액과 달라 종료 규칙을 진행할 수 없어요.
          </p>
          <Link href={`/app/assets/${asset.id}`} className="text-sm text-primary-strong underline">
            자산 상세에서 납부액 확인하기
          </Link>
        </main>
      </>
    );
  }

  function handleSave() {
    if (!asset) return;
    updateAsset(asset.id, { terminationNote: note.trim() || undefined });
    setSaved(true);
    router.push(`/app/assets/${asset.id}/settlement`);
  }

  return (
    <>
      <AppHeader title="종료 규칙" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
      <main className="flex flex-1 flex-col gap-7 px-5 pt-2 pb-8">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-7 text-xl leading-7 font-bold tracking-[-0.01em] text-primary">
            공동소유를 어떻게 끝낼까요?
          </legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-[1.5px] border-primary-strong bg-primary-soft p-[18px] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent">
            <input type="radio" name="termination-kind" value="sale" checked readOnly className="sr-only" />
            {/* eslint-disable-next-line @next/next/no-img-element -- Figma에서 받은 라디오 아이콘(22px) 그대로 사용 */}
            <img src="/icons/radio-checked.svg" alt="" width={22} height={22} className="shrink-0" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[15px] leading-[22px] font-medium text-primary">매각</span>
              <span className="text-[13px] leading-[18px] text-text-muted">매각가를 입력하면 지분율대로 나눠요</span>
            </span>
          </label>
          {["한 명의 인수", "폐기"].map((label) => (
            <label
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-[18px]"
            >
              <input type="radio" name="termination-kind" value={label} disabled className="sr-only" />
              <span className="flex flex-1 items-center gap-3 opacity-55">
                <span aria-hidden="true" className="size-[22px] shrink-0 rounded-full border-2 border-border" />
                <span className="text-[15px] leading-[22px] font-medium text-primary">{label}</span>
              </span>
              <span className="shrink-0 text-xs leading-4 text-text-muted">다음 버전에서 제공</span>
            </label>
          ))}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="termination-note" className="text-sm leading-5 font-medium text-text">
            종료 합의 메모 (선택)
          </label>
          <textarea
            id="termination-note"
            aria-describedby="termination-note-hint"
            className={textareaClassName}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 중고 시세를 확인하고 셋이 합의한 가격에 판매"
          />
          <p id="termination-note-hint" className="text-xs leading-4 text-text-muted">
            평가액 산정 기준·특약 등을 자유롭게 적어 주세요
          </p>
        </div>
      </main>
      <BottomBar>
        {saved && (
          <p role="status" className="text-center text-xs leading-4 text-success">
            저장되었습니다.
          </p>
        )}
        <Button onClick={handleSave}>저장하고 정산으로 이동</Button>
      </BottomBar>
    </>
  );
}
