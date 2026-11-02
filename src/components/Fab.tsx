import Link from "next/link";
import { Icon } from "@/components/Icon";

// 출처: Figma "우리몫 디자인 시안 > 컴포넌트 > FAB" — 52px pill, primary-strong 배경, + 아이콘 + 라벨,
// 파란 그림자(0 6px 8px rgba(29,78,216,.28)). 아이콘만 두지 않고 라벨을 함께 둔다.
// 스크롤 컨테이너 기준 sticky — 탭바(64px) 위로 20px 띄워 bottom 84px에 고정. 목록 끝까지 스크롤하면
// 일반 흐름 위치(pb-5)로 돌아오므로 마지막 항목을 가리지 않는다.
export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <div className="pointer-events-none sticky bottom-[84px] z-10 flex justify-center pt-2 pb-5">
      <Link
        href={href}
        className="pointer-events-auto flex h-[52px] items-center gap-1.5 rounded-full bg-primary-strong pr-[22px] pl-[18px] text-[15px] leading-[22px] font-medium text-white drop-shadow-[0_6px_8px_rgba(29,78,216,0.28)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Icon name="plus" />
        {label}
      </Link>
    </div>
  );
}
