import { ButtonLink } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";

// 랜딩 — 시각: Figma "00 랜딩"(node 2163:613).
// 배경: primary-soft(#E8EFFC) 위에 위쪽 619px 동안 흰색 → 투명으로 사라지는 세로 그라디언트.
// 위에서부터 카드 일러스트(342×280, 위 79px) → 11px → 2.5D 상자 픽토그램(200px) → 19px → 가운데 정렬 두 줄 헤드라인,
// 맨 아래 남색 pill "시작하기"(위 16 · 아래 36). 시안에 없는 서비스명·설명·체크 목록·안내 문구는 넣지 않는다.
// 일러스트는 화면 코드로 그린 예시라 실제 데이터로 오해되지 않도록 스크린리더에서는 숨긴다(aria-hidden).
//
// 카드 기울기: Figma는 노드의 왼쪽 위 꼭짓점(x, y)을 기준으로 회전하고 양수가 반시계 방향이다.
// 그래서 같은 left/top에 transform-origin을 왼쪽 위로 두고 부호를 바꿔 회전한다(5° → -5deg, -4° → 4deg).
const FLOAT_CARD = "absolute origin-top-left rounded-[20px] bg-surface p-[18px] shadow-[0_10px_28px_0_rgba(20,33,61,0.1)]";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col bg-primary-soft bg-[linear-gradient(180deg,#ffffff_0px,rgba(255,255,255,0)_619px)]">
      <div className="flex flex-1 flex-col items-center px-6 pt-[79px]">
        <div aria-hidden="true" className="relative h-[280px] w-[342px] max-w-full shrink-0">
          <div className={`top-5 left-2 flex w-[220px] -rotate-5 flex-col gap-2.5 ${FLOAT_CARD}`}>
            <p className="text-[15px] leading-[22px] font-medium text-primary">공용 냉장고</p>
            <span className="flex -space-x-2">
              {["지", "서", "하"].map((n) => (
                <Avatar key={n} name={n} className="ring-2 ring-surface" />
              ))}
            </span>
            <p className="text-[13px] leading-[18px] text-text-muted">참여자 3명 · 총 900,000원</p>
          </div>
          <div className={`top-[140px] left-[104px] flex w-[230px] rotate-4 flex-col gap-1.5 whitespace-nowrap ${FLOAT_CARD}`}>
            <p className="text-[13px] leading-[18px] font-medium text-text-muted">정산 결과</p>
            <p className="flex items-center gap-1.5">
              <span className="text-xl leading-7 font-bold tracking-[-0.01em] text-primary">+ 200,250원</span>
              <span className="text-[13px] leading-[18px] text-text-muted">받음</span>
            </p>
            <p className="text-xs leading-4 text-text-muted">450,000 × 44.5%</p>
          </div>
          <div className="absolute top-[68px] left-[260px] flex size-14 items-center justify-center rounded-full bg-surface text-primary-strong shadow-[0_10px_28px_0_rgba(20,33,61,0.1)]">
            <Icon name="check" size={26} />
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/empty-assets.svg"
          alt=""
          aria-hidden="true"
          width={200}
          height={200}
          className="mt-[11px] block size-[200px] shrink-0"
        />

        <h1 className="mt-[19px] w-full text-center text-2xl leading-9 font-bold tracking-[-0.02em] text-primary">
          공동소유 자산의
          <br />
          지분과 비용을 기록해요
        </h1>
      </div>

      <div className="flex flex-col items-center px-6 pt-4 pb-9">
        <ButtonLink href="/app" className="w-full">
          시작하기
        </ButtonLink>
      </div>
    </main>
  );
}
