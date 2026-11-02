"use client";

import { LargeHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/Section";
import { StepTimeline } from "@/components/StepTimeline";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";

// 설정 — 데이터 초기화 및 앱 정보 (탭바 3번째 탭).
// 시각: Figma "09 설정" — 큰 제목, 번호 레일 이용 방법,
// 흰 테두리 pill의 빨간 "모든 데이터 초기화", 앱 정보 텍스트. 섹션 간격 36px.
// 결제·인증 등 MVP 범위를 벗어나는 기능은 추가하지 않는다(CLAUDE.md Boundaries).
const GUIDE_STEPS = [
  { title: "공동구매 시작", desc: "함께 산 물건을 자산으로 등록하고 참여자를 정해요." },
  { title: "지분 확인", desc: "납부액 또는 균등 분할로 각자의 지분율을 계산해요." },
  { title: "공동비용 기록", desc: "수리비·배송비 등 추가로 든 비용을 누가 냈는지 기록해요." },
  { title: "종료 규칙 합의", desc: "공동소유를 끝낼 때 어떻게 정리할지 미리 정해요." },
  { title: "정산", desc: "매각가를 입력하면 지분율대로 받을 금액을 계산해요." },
] as const;

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
      <main className="flex flex-1 flex-col gap-9 px-5 pt-3 pb-8">
        <section className="flex flex-col gap-4">
          <SectionHeader title="우리몫 이용 방법" />
          <StepTimeline steps={GUIDE_STEPS} />
        </section>

        <section className="flex flex-col gap-2.5">
          <SectionHeader title="데이터" />
          <Button variant="danger" onClick={handleReset}>
            모든 데이터 초기화
          </Button>
          <p className="text-[13px] leading-[18px] text-text-muted">
            이 기기의 브라우저에 저장된 모든 자산·비용 기록을 삭제해요.
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <SectionHeader title="앱 정보" />
          <p className="text-[13px] leading-[18px] text-text-muted">
            우리몫 · 공동소유 자산의 지분·비용을 기록하고 정산하는 서비스
          </p>
          <p className="text-[13px] leading-[18px] text-text-muted">모든 데이터는 서버가 아닌 이 브라우저에만 저장돼요.</p>
        </section>
      </main>
    </>
  );
}
