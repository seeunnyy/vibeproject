"use client";

import { use } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AvatarGroup } from "@/components/Avatar";
import { BottomBar, ButtonLink } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { StatusScreen } from "@/components/StatusScreen";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { TERMINATION_LABEL, isEnded, withJosa } from "@/lib/labels";

// 10·11 종료 완료 — 시각: Figma "10 종료 완료 · 인수" / "11 종료 완료 · 폐기".
// 헤더 없이 위 88px 여백, 72px 체크 원 + 26px 제목 + 15px 설명, 회색 정보 카드(자산·종료 방식·종료일·참여자),
// 테두리 안내 박스, 하단 "자산 목록으로"(남색) · "공유 요약 보기"(흰색).
// 인수·폐기는 금액을 계산하지 않는다 — 안내 박스로 그 사실을 알린다.
const NOTICE = {
  buyout: ["인수 금액은 앱에서 계산하지 않아요.", "참여자끼리 정한 대로 주고받아 주세요."],
  disposal: ["폐기에 든 비용은 앱에서 나누지 않아요.", "참여자끼리 정한 대로 정리해 주세요."],
} as const;

export default function EndedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assets, mounted } = useAssetStore();
  const asset = assets.find((a) => a.id === id);

  if (!asset) {
    return (
      <>
        <AppHeader title="종료 완료" backHref="/app" />
        {mounted ? (
          <StatusScreen message="해당 자산을 찾을 수 없어요." actionLabel="목록으로 돌아가기" href="/app" />
        ) : (
          <main className="flex-1" />
        )}
      </>
    );
  }

  if (!isEnded(asset) || asset.termination.kind === "sale") {
    return (
      <>
        <AppHeader title="종료 완료" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
        <StatusScreen
          message="아직 공동소유를 종료하지 않은 자산이에요."
          actionLabel="자산 상세로 돌아가기"
          href={`/app/assets/${asset.id}`}
        />
      </>
    );
  }

  const label = TERMINATION_LABEL[asset.termination.kind];
  const rows = [
    { label: "자산", value: asset.name },
    { label: "종료 방식", value: label },
    { label: "종료일", value: asset.endedAt },
  ];

  return (
    <>
      <main className="flex flex-1 flex-col gap-7 px-5 pt-[88px] pb-8">
        <div className="flex flex-col gap-2.5">
          <span aria-hidden="true" className="flex size-[72px] items-center justify-center rounded-full bg-primary-soft text-primary-strong">
            <Icon name="check" size={36} />
          </span>
          <span aria-hidden="true" className="h-1.5" />
          <h1 className="text-[26px] leading-9 font-bold tracking-[-0.02em] text-primary">공동소유를 종료했어요</h1>
          <p className="text-[15px] leading-[22px] text-text-muted">
            {withJosa(asset.name, "을", "를")} {withJosa(label, "으로", "로")} 정리했어요.
          </p>
        </div>

        <dl className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4 tabular-nums">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center">
              <dt className="flex-1 text-[13px] leading-[18px] text-text-muted">{row.label}</dt>
              <dd className="text-sm leading-5 font-medium text-primary">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-center">
            <dt className="flex-1 text-[13px] leading-[18px] text-text-muted">참여자</dt>
            <dd>
              <span className="sr-only">{asset.members.map((m) => m.name).join(", ")}</span>
              <AvatarGroup names={asset.members.map((m) => m.name)} bordered />
            </dd>
          </div>
        </dl>

        <p className="flex items-start gap-2 rounded-2xl border border-border bg-surface px-4 py-3.5 text-[13px] leading-[18px] text-text-muted">
          <Icon name="alert" size={16} className="mt-px" />
          <span>
            {NOTICE[asset.termination.kind][0]}
            <br />
            {NOTICE[asset.termination.kind][1]}
          </span>
        </p>
      </main>
      <BottomBar borderless>
        <ButtonLink href="/app">자산 목록으로</ButtonLink>
        <ButtonLink href={`/app/assets/${asset.id}/summary`} variant="secondary">
          공유 요약 보기
        </ButtonLink>
      </BottomBar>
    </>
  );
}
