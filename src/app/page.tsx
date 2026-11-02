import { ButtonLink } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";

// 랜딩 — 시각: Figma "00 랜딩".
// 연한 파란(primary-soft) 배경 위에 서비스명, 카드 일러스트(자산 카드 · 정산 결과 카드 · 체크 배지),
// 두 줄 헤드라인, 체크 목록, 하단 남색 pill CTA. 일러스트는 화면 코드로 그린 예시라 실제 데이터로
// 오해되지 않도록 스크린리더에서는 숨긴다(aria-hidden). 시안의 로고 서체 대신 시스템 폰트를 쓴다.
const BENEFITS = [
  "각자의 지분과 부담을 기록해 두고 언제든 확인해요",
  "수리비·배송비 같은 추가 비용도 빠짐없이 남겨요",
  "종료 규칙을 미리 정해 정산 갈등을 줄여요",
] as const;

const FLOAT_CARD = "rounded-[20px] bg-surface p-[18px] shadow-[0_10px_28px_0_rgba(20,33,61,0.1)]";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col bg-primary-soft">
      <div className="flex flex-1 flex-col items-center px-6 pt-[66px] pb-2">
        <p className="text-[32px] leading-8 font-bold tracking-[-0.01em] text-[#6a83b3]">우리몫</p>

        <div aria-hidden="true" className="relative mt-[54px] h-[280px] w-[342px] max-w-full shrink-0">
          <div className="absolute top-[0.83px] left-2 flex h-[146.687px] w-[230.319px] items-center justify-center">
            <div className={`flex w-[220px] -rotate-5 flex-col gap-2.5 ${FLOAT_CARD}`}>
              <p className="text-[15px] leading-[22px] font-medium text-primary">공용 냉장고</p>
              <span className="flex -space-x-2">
                {["지", "서", "하"].map((n) => (
                  <Avatar key={n} name={n} className="border-2 border-surface" />
                ))}
              </span>
              <p className="text-[13px] leading-[18px] text-text-muted">참여자 3명 · 총 900,000원</p>
            </div>
          </div>
          <div className="absolute top-[140px] left-[96.33px] flex h-[125.776px] w-[237.113px] items-center justify-center">
            <div className={`flex w-[230px] rotate-4 flex-col gap-1.5 whitespace-nowrap ${FLOAT_CARD}`}>
              <p className="text-[13px] leading-[18px] font-medium text-text-muted">정산 결과</p>
              <p className="flex items-center gap-1.5">
                <span className="text-xl leading-7 font-bold tracking-[-0.01em] text-primary">+ 200,250원</span>
                <span className="text-[13px] leading-[18px] text-text-muted">받음</span>
              </p>
              <p className="text-xs leading-4 text-text-muted">450,000 × 44.5%</p>
            </div>
          </div>
          <div className="absolute top-[18px] left-[270px] flex size-14 items-center justify-center rounded-full bg-surface text-primary-strong shadow-[0_10px_28px_0_rgba(20,33,61,0.1)]">
            <Icon name="check" size={26} />
          </div>
        </div>

        <div className="mt-10 flex w-full flex-col gap-7">
          <h1 className="text-[26px] leading-9 font-bold tracking-[-0.02em] text-primary">
            공동소유 자산의
            <br />
            지분과 비용을 기록해요
          </h1>
          <ul className="flex flex-col gap-2.5">
            {BENEFITS.map((text) => (
              <li key={text} className="flex items-center gap-2 text-[13px] leading-[18px] text-text">
                <Icon name="check" size={18} className="text-primary-strong" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 px-6 pt-4 pb-9">
        <ButtonLink href="/app" className="w-full">
          시작하기
        </ButtonLink>
        <p className="text-xs leading-4 text-text-muted">로그인 없이, 이 브라우저에만 저장돼요</p>
      </div>
    </main>
  );
}
