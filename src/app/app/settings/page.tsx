"use client";

import { AppHeader } from "@/components/AppHeader";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";
import { computeSaleSettlement } from "@/lib/calc/settlement";

// 설정 — 데이터 초기화 및 앱 정보 (탭바 3번째 탭).
// 초기 버전은 버튼 하나 + 텍스트 두 줄뿐이라 화면이 휑해 보인다는 피드백을 받아,
// (1) 데이터 현황 요약 카드와 (2) 서비스 이용 방법 가이드를 추가해 실제 도움이 되는
// 콘텐츠로 채웠다. 카드 없이 모든 섹션을 제목·여백으로 구분한다
// (docs/DESIGN.md "카드 사용 원칙"). 결제·인증 등 MVP 범위를 벗어나는 기능은 추가하지 않는다(CLAUDE.md Boundaries).
const GUIDE_STEPS = [
  { title: "공동구매 시작", desc: "함께 산 물건을 자산으로 등록하고 참여자를 정해요." },
  { title: "지분 확인", desc: "납부액 또는 균등 분할로 각자의 지분율을 계산해요." },
  { title: "공동비용 기록", desc: "수리비·배송비 등 추가로 든 비용을 누가 냈는지 기록해요." },
  { title: "종료 규칙 합의", desc: "공동소유를 끝낼 때 어떻게 정리할지 미리 정해요." },
  { title: "정산", desc: "매각가를 입력하면 지분율대로 받을 금액을 계산해요." },
] as const;

export default function SettingsPage() {
  const { assets, resetStore } = useAssetStore();

  const settledCount = assets.filter((asset) => {
    const check = checkContribution(asset);
    return check.ok && computeSaleSettlement(asset) !== null;
  }).length;
  const memberCount = assets.reduce((sum, asset) => sum + asset.members.length, 0);

  function handleReset() {
    if (window.confirm("모든 자산 데이터를 삭제할까요? 되돌릴 수 없습니다.")) {
      resetStore();
    }
  }

  return (
    <>
      <AppHeader title="설정" />
      <main className="flex flex-1 flex-col gap-8 px-4 py-6">
        {/* 대시보드식 큰 파란 숫자 타일 대신, 본문색 숫자 + 보조 라벨의 좌측 정렬 통계 행으로 둔다(장식색 제거). */}
        <section aria-label="데이터 현황">
          <dl className="grid grid-cols-3 gap-4">
            {[
              { label: "등록 자산", value: assets.length },
              { label: "정산 완료", value: settledCount },
              { label: "참여자 수", value: memberCount },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-0.5">
                <dt className="text-xs text-text-muted">{stat.label}</dt>
                <dd className="text-xl font-semibold tabular-nums text-text">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 읽기 전용 안내는 카드 없이 제목 + 여백으로만 구분한다. */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text">우리몫 이용 방법</h2>
          <ol className="flex flex-col gap-3">
            {GUIDE_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="w-4 shrink-0 text-sm font-semibold tabular-nums text-text-muted">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-text">{step.title}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text">데이터</h2>
          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-11 items-center justify-center rounded-lg border border-border text-center text-sm font-medium text-red-600"
          >
            모든 데이터 초기화
          </button>
          <p className="text-xs text-text-muted">이 기기의 브라우저에 저장된 모든 자산·비용 기록을 삭제해요.</p>
        </section>

        <section className="flex flex-col gap-1 border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-text">앱 정보</h2>
          <p className="text-xs text-text-muted">우리몫 · 공동소유 자산의 지분·비용을 기록하고 정산하는 서비스</p>
          <p className="text-xs text-text-muted">모든 데이터는 서버가 아닌 이 브라우저에만 저장돼요.</p>
        </section>
      </main>
    </>
  );
}
