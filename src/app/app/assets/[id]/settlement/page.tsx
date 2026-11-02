"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { BottomBar, ButtonLink } from "@/components/Button";
import { FormField } from "@/components/FormField";
import { NumberInput } from "@/components/NumberInput";
import { SettlementResult } from "@/components/SettlementResult";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";

// S6 정산 — 출처: planning/md-design/03_UX_UI_SPEC.md S6
// 근거: FR-8, FR-9, R-4, R-7, AC-6, AC-9, AC-10.
// 시각: Figma "06 정산" — "원" 단위 매각가 입력 + 도움말, 파란 "받을 금액" 카드, 검증 문구, 하단 고정 "요약 보기".
export default function SettlementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assets, mounted, updateAsset } = useAssetStore();
  const asset = assets.find((a) => a.id === id);

  const contributionCheck = useMemo(
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true, hasNegativeMember: false }),
    [asset],
  );
  const settlement = useMemo(() => (asset ? computeSaleSettlement(asset) : null), [asset]);

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="정산" backHref="/app" />
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
        <AppHeader title="정산" backHref="/app" />
        <main className="flex-1" />
      </>
    );
  }

  if (!contributionCheck.ok) {
    return (
      <>
        <AppHeader title="정산" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-error">납부액 합계가 총 구매금액과 달라 정산을 진행할 수 없어요.</p>
          <Link href={`/app/assets/${asset.id}`} className="text-sm text-primary-strong underline">
            자산 상세에서 납부액 확인하기
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="정산" backHref={`/app/assets/${asset.id}/termination`} closeHref="/app" />
      <main className="flex flex-1 flex-col gap-6 px-5 pt-2 pb-8">
        <FormField label="매각가" htmlFor="sale-price" required hint="실제로 판매한 금액을 입력해 주세요">
          <NumberInput
            id="sale-price"
            value={asset.salePrice ?? ""}
            onChange={(value) => updateAsset(asset.id, { salePrice: value === "" ? undefined : value })}
            min={0}
            placeholder="1,200,000"
          />
        </FormField>

        {settlement ? (
          <SettlementResult result={settlement} members={asset.members} />
        ) : (
          <p className="text-[13px] leading-[18px] text-text-muted">매각가를 입력하면 정산 결과가 표시됩니다.</p>
        )}
      </main>
      <BottomBar>
        <ButtonLink href={`/app/assets/${asset.id}/summary`}>요약 보기</ButtonLink>
      </BottomBar>
    </>
  );
}
