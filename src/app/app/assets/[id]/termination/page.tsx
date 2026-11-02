"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { StatusScreen } from "@/components/StatusScreen";
import { BottomBar, Button } from "@/components/Button";
import { textareaClassName } from "@/components/FormField";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";
import { TERMINATION_LABEL } from "@/lib/labels";
import type { TerminationKind } from "@/lib/types";

const OPTIONS: Array<{ kind: TerminationKind; desc: string }> = [
  { kind: "sale", desc: "매각가를 입력하면 지분율대로 나눠요" },
  { kind: "buyout", desc: "한 명이 물건을 갖고 공동소유를 끝내요" },
  { kind: "disposal", desc: "물건을 처분하고 공동소유를 끝내요" },
];

// 이 기기 기준 오늘 날짜(yyyy-mm-dd). toISOString()은 UTC라 한국 오전 9시 전에는 하루 전이 된다.
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// S5 종료 규칙 — 출처: planning/md-design/03_UX_UI_SPEC.md S5
// 근거: FR-7. 시각: Figma "05 종료 규칙" · "05-1 인수 선택" · "05-2 폐기 선택".
// 세 방식 모두 선택 가능. 매각 → "저장하고 정산으로 이동"(S6), 인수·폐기 → "공동소유 종료하기"(10·11 종료 완료).
// 인수·폐기는 계산 없이 종료 방식과 종료일만 저장한다. 선택지는 실제 radio input(시각적으로 숨김)으로 둔다.
export default function TerminationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { assets, mounted, updateAsset } = useAssetStore();
  const asset = assets.find((a) => a.id === id);
  const [note, setNote] = useState(asset?.terminationNote ?? "");
  // 사용자가 고르기 전에는 저장된 종료 방식을 보여준다(자산은 마운트 후에 불러와지므로 초기값으로 쓰지 않는다).
  const [picked, setPicked] = useState<TerminationKind | null>(null);

  const contributionCheck = useMemo(
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true, hasNegativeMember: false }),
    [asset],
  );

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="종료 규칙" backHref="/app" />
        <StatusScreen message="해당 자산을 찾을 수 없어요." actionLabel="목록으로 돌아가기" href="/app" />
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
        <StatusScreen
          tone="error"
          message="납부액 합계가 총 구매금액과 달라 종료 규칙을 진행할 수 없어요."
          actionLabel="자산 상세에서 납부액 확인하기"
          href={`/app/assets/${asset.id}`}
        />
      </>
    );
  }

  const kind = picked ?? asset.termination.kind;

  function handleSave() {
    if (!asset) return;
    const terminationNote = note.trim() || undefined;
    if (kind === "sale") {
      updateAsset(asset.id, { termination: { kind }, endedAt: undefined, terminationNote });
      router.push(`/app/assets/${asset.id}/settlement`);
    } else {
      updateAsset(asset.id, { termination: { kind }, endedAt: today(), terminationNote });
      router.push(`/app/assets/${asset.id}/ended`);
    }
  }

  return (
    <>
      <AppHeader title="종료 규칙" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
      <main className="flex flex-1 flex-col gap-7 px-5 pt-2 pb-8">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-7 text-xl leading-7 font-bold tracking-[-0.01em] text-primary">
            공동소유를 어떻게 끝낼까요?
          </legend>
          {OPTIONS.map((opt) => {
            const selected = kind === opt.kind;
            return (
              <label
                key={opt.kind}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl p-[18px] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                  selected ? "border-[1.5px] border-primary-strong bg-primary-soft" : "border border-border bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name="termination-kind"
                  value={opt.kind}
                  checked={selected}
                  onChange={() => setPicked(opt.kind)}
                  className="sr-only"
                />
                {selected ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Figma에서 받은 라디오 아이콘(22px) 그대로 사용
                  <img src="/icons/radio-checked.svg" alt="" width={22} height={22} className="shrink-0" />
                ) : (
                  <span aria-hidden="true" className="size-[22px] shrink-0 rounded-full border-2 border-border" />
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] leading-[22px] font-medium text-primary">{TERMINATION_LABEL[opt.kind]}</span>
                  <span className="text-[13px] leading-[18px] text-text-muted">{opt.desc}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="termination-note" className="text-sm leading-5 font-medium text-text">
            종료 합의 메모 (선택)
          </label>
          <textarea
            id="termination-note"
            className={textareaClassName}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 중고 시세를 확인하고 셋이 합의한 가격에 판매"
          />
        </div>
      </main>
      <BottomBar>
        <Button onClick={handleSave}>{kind === "sale" ? "저장하고 정산으로 이동" : "공동소유 종료하기"}</Button>
      </BottomBar>
    </>
  );
}
