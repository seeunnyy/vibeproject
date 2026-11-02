"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { StatusScreen } from "@/components/StatusScreen";
import { BottomBar, Button, ButtonLink } from "@/components/Button";
import { FormField } from "@/components/FormField";
import { NumberInput } from "@/components/NumberInput";
import { SettlementResult } from "@/components/SettlementResult";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";

// S6 정산 — 출처: planning/md-design/03_UX_UI_SPEC.md S6
// 근거: FR-8, FR-9, R-4, R-7, AC-6, AC-9, AC-10.
// 시각: Figma "06 정산" — "원" 단위 매각가 입력, 파란 "받을 금액" 카드, 검증 문구,
// 하단 "요약 보기"(흰색) · "저장하기"(남색). 매각가는 입력할 때마다 이미 저장되므로 "저장하기"는 자산 목록으로
// 이동만 한다. 매각가가 비어 있으면(0 포함, 정산 결과가 없으므로) 누를 수 없다.
export default function SettlementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
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
        <StatusScreen message="해당 자산을 찾을 수 없어요." actionLabel="목록으로 돌아가기" href="/app" />
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
        <StatusScreen
          tone="error"
          message="납부액 합계가 총 구매금액과 달라 정산을 진행할 수 없어요."
          actionLabel="자산 상세에서 납부액 확인하기"
          href={`/app/assets/${asset.id}`}
        />
      </>
    );
  }

  return (
    <>
      <AppHeader title="정산" backHref={`/app/assets/${asset.id}/termination`} closeHref="/app" />
      <main className="flex flex-1 flex-col gap-6 px-5 pt-2 pb-8">
        <FormField label="매각가" htmlFor="sale-price" required>
          <NumberInput
            id="sale-price"
            value={asset.salePrice ?? ""}
            onChange={(value) => updateAsset(asset.id, { salePrice: value === "" ? undefined : value })}
            min={0}
            placeholder="1,200,000"
            autoComplete="off"
          />
        </FormField>

        {settlement ? (
          <SettlementResult result={settlement} members={asset.members} />
        ) : (
          <p className="text-[13px] leading-[18px] text-text-muted">매각가를 입력하면 정산 결과가 표시됩니다.</p>
        )}
      </main>
      <BottomBar row>
        <ButtonLink href={`/app/assets/${asset.id}/summary`} variant="secondary">
          요약 보기
        </ButtonLink>
        <Button disabled={!asset.salePrice} onClick={() => router.push("/app")}>
          저장하기
        </Button>
      </BottomBar>
    </>
  );
}
