import Link from "next/link";

// 랜딩 — 화면 전체를 가운데 정렬한 hero 대신, 왼쪽 정렬 한 축으로 읽히게 구성한다.
// 위계: 서비스명(작게) → 한 줄 정의(가장 크게) → 해결하는 문제(구분선 목록) → 하단 고정 CTA.
export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col bg-primary px-6 pt-14 pb-8 text-white">
      <h1 className="text-sm font-semibold tracking-wide text-white/70">우리몫</h1>
      <p className="mt-4 text-2xl leading-snug font-semibold">
        공동소유 자산의 지분과 비용을 기록하고, 합의된 규칙에 따라 공동소유를 종료하는 모바일 웹 서비스예요.
      </p>

      <section className="mt-12">
        <h2 className="text-xs font-medium text-white/60">이런 문제를 해결해요</h2>
        <ul className="mt-3 divide-y divide-white/15 border-y border-white/15 text-[15px] text-white/90">
          <li className="py-3">지분·부담이 불명확해서 나중에 확인하기 어려워요</li>
          <li className="py-3">추가 비용 기록이 누락돼 재계산이 어려워요</li>
          <li className="py-3">종료 규칙을 미리 정하지 않아 정산 갈등이 생겨요</li>
        </ul>
      </section>

      <div className="mt-auto pt-10">
        <Link
          href="/app"
          className="flex min-h-12 items-center justify-center rounded-lg bg-white text-[15px] font-semibold text-primary-strong"
        >
          시작하기
        </Link>
      </div>
    </main>
  );
}
