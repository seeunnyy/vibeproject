"use client";

import { LargeHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { Icon, type IconName } from "@/components/Icon";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";

// 설정 — 이용 방법 안내 + 데이터 초기화 (탭바 3번째 탭).
// 시각: Figma "09 설정"(node 2187:1152) — 큰 제목, "우리몫 이용 방법" 아래 회색 카드 2장(01 자산 등록 · 02 공동 관리,
// 번호는 제목 앞에 붙임) + 파란 강조 카드(03 지분대로 정산), 화면 아래쪽 탭바 위에 흰 테두리 "데이터 초기화" 버튼만.
// 결제·인증 등 MVP 범위를 벗어나는 기능은 추가하지 않는다(CLAUDE.md Boundaries).
const GUIDE_CARDS: { icon: IconName; title: string; desc: string }[] = [
  { icon: "tab-assets", title: "01 자산 등록", desc: "참여자·지분 설정" },
  { icon: "tab-settings", title: "02 공동 관리", desc: "비용·종료 규칙 기록" },
];

export default function SettingsPage() {
  const { resetStore } = useAssetStore();

  function handleReset() {
    if (window.confirm("모든 자산 데이터를 삭제할까요? 되돌릴 수 없습니다.")) {
      resetStore();
    }
  }

  return (
    <>
      <LargeHeader title="설정" />
      {/* 시안 content: 위 20px · 아래 24px · 좌우 20px. 데이터 초기화는 여유 공간(flex-1) 뒤 맨 아래에 놓이고,
          시안의 데이터 카드 안쪽 16px 여백만큼 더 들여 화면 끝에서 좌우 36px · 탭바까지 40px. */}
      <main className="flex flex-1 flex-col px-5 pt-5 pb-6">
        <section className="flex flex-col gap-4">
          <h2 className="text-base leading-6 font-bold tracking-[-0.01em] text-primary">우리몫 이용 방법</h2>
          <div className="flex h-40 gap-4">
            {GUIDE_CARDS.map((card) => (
              <div key={card.title} className="flex min-w-0 flex-1 flex-col gap-[18px] rounded-[20px] bg-surface-muted p-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-surface text-primary-strong">
                  <Icon name={card.icon} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base leading-6 font-bold tracking-[-0.01em] text-primary">{card.title}</h3>
                  <p className="text-[13px] leading-[18px] text-text-muted">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex h-[88px] items-center gap-3.5 rounded-[20px] bg-primary-soft px-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-surface text-primary-strong">
              <Icon name="tab-settlements" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h3 className="text-base leading-6 font-bold tracking-[-0.01em] whitespace-pre-wrap text-primary-strong">
                {"03  지분대로 정산"}
              </h3>
              <p className="text-[13px] leading-[18px] text-text-muted">매각가 입력 → 내 몫 자동 계산</p>
            </div>
          </div>
        </section>

        <div className="min-h-10 flex-1" aria-hidden="true" />

        <div className="px-4 pb-4">
          <Button variant="danger" onClick={handleReset} className="min-h-12! w-full rounded-xl!">
            데이터 초기화
          </Button>
        </div>
      </main>
    </>
  );
}
