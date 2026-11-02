import Link from "next/link";
import { Icon } from "@/components/Icon";

// 출처: Figma "우리몫 디자인 시안 > 컴포넌트 > FAB" — 52px pill, primary-strong 배경, + 아이콘 + 라벨,
// 파란 그림자(0 6px 8px rgba(29,78,216,.28)). 아이콘만 두지 않고 라벨을 함께 둔다.
const FAB_LINK =
  "flex h-[52px] items-center gap-1.5 rounded-full bg-primary-strong pr-[22px] pl-[18px] text-[15px] leading-[22px] font-medium text-white drop-shadow-[0_6px_8px_rgba(29,78,216,0.28)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none";

// 본문 흐름 안에 그대로 놓는 FAB 모양 링크 (Figma "01-0 자산 목록 · 빈 상태"의 "첫 자산 등록하기").
export function FabLink({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <Link href={href} className={`${FAB_LINK} ${className}`}>
      <Icon name="plus" />
      {label}
    </Link>
  );
}

// 스크롤 컨테이너 기준 sticky — 탭바(64px) 바로 위에 붙고 pb-5(20px)만큼 띄워 시안 위치(탭바 위 20px)에 맞춘다. 목록 끝까지 스크롤하면
// 일반 흐름 위치(pb-5)로 돌아오므로 마지막 항목을 가리지 않는다.
export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <div className="pointer-events-none sticky bottom-16 z-10 flex justify-center pt-2 pb-5">
      <FabLink href={href} label={label} className="pointer-events-auto" />
    </div>
  );
}
