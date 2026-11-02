"use client";

import Link from "next/link";
import { LargeHeader } from "@/components/AppHeader";
import { AvatarGroup } from "@/components/Avatar";
import { Banner } from "@/components/Banner";
import { EmptyState } from "@/components/EmptyState";
import { Fab } from "@/components/Fab";
import { Icon } from "@/components/Icon";
import { ContributionDiffNote, StatusBadge } from "@/components/StatusBadge";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { won } from "@/lib/calc/format";
import type { Asset } from "@/lib/types";

// S1 자산 목록 — 출처: planning/md-design/03_UX_UI_SPEC.md S1
// 시각: Figma "01 자산 목록" — 큰 제목 헤더, 자산마다 회색 카드(surface-muted, 모서리 16px, 패딩 16px),
// 하단 떠 있는 "자산 추가" 버튼(FAB). 카드 전체가 자산 상세로 가는 링크다.
// 자산 삭제는 목록에서 빼고 자산 상세 맨 아래 "이 자산 삭제"로 옮겼다(실수로 지우는 일을 줄이기 위함).
export default function AssetListPage() {
  const { assets, mounted, loadError, saveError, resetStore } = useAssetStore();

  return (
    <>
      <LargeHeader title="자산 목록" caption={mounted ? `함께 산 물건 ${assets.length}개` : undefined} />
      <main className="flex flex-1 flex-col gap-3 px-5 pt-3 pb-2">
        {loadError && (
          <Banner
            tone="error"
            message="저장된 데이터를 불러오지 못했습니다."
            action={{ label: "초기화", onClick: resetStore }}
          />
        )}
        {saveError && <Banner tone="warn" message="저장되지 않을 수 있습니다. 브라우저 설정을 확인해 주세요." />}

        {mounted && assets.length === 0 && (
          <EmptyState message="아직 등록한 자산이 없어요" actionLabel="자산 추가" actionHref="/app/assets/new" />
        )}

        {assets.length > 0 && (
          <ul className="flex flex-col gap-3">
            {assets.map((asset) => (
              <li key={asset.id}>
                <AssetCard asset={asset} />
              </li>
            ))}
          </ul>
        )}
      </main>
      {assets.length > 0 && <Fab href="/app/assets/new" label="자산 추가" />}
    </>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const manager = asset.members.find((m) => m.id === asset.managerId);

  return (
    <Link
      href={`/app/assets/${asset.id}`}
      className="flex flex-col gap-2.5 rounded-2xl bg-surface-muted p-4 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      <div className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 truncate text-[15px] leading-[22px] font-medium text-primary">{asset.name}</h2>
        <StatusBadge asset={asset} />
      </div>
      <p className="text-[13px] leading-[18px] text-text-muted tabular-nums">
        참여자 {asset.members.length}명 · 총 {won(asset.totalAmount)}
      </p>
      <ContributionDiffNote asset={asset} />
      <div className="flex items-center justify-between">
        <AvatarGroup names={asset.members.map((m) => m.name)} />
        <span className="flex items-center gap-0.5 text-[13px] leading-[18px] text-text-muted">
          관리자 {manager ? manager.name : "미지정"}
          <Icon name="chevron-right" size={18} />
        </span>
      </div>
    </Link>
  );
}
