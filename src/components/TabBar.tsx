"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 하단 탭바 — 최상위 3개 화면(자산 목록 / 정산 현황 / 설정) 전용 네비게이션.
// src/app/app/layout.tsx가 /app 아래 모든 화면(자산 상세 드릴다운 포함)에 공통으로
// 렌더링하므로, 이 컴포넌트가 직접 pathname을 보고 3개 화면 밖에서는 null을 반환한다.
// 자산 상세 이하 드릴다운 화면(assets/[id], .../costs, .../termination 등)에는
// 노출하지 않는다 — 해당 화면은 AppHeader의 뒤로가기 + "자산 목록으로 나가기"로 이동한다.
// 아이콘: 이모지(OS마다 모양·색이 다르고 남색 톤과 충돌)를 쓰지 않고 같은 두께의 라인 아이콘으로 통일한다.
// 의존성 추가 없이 인라인 SVG path만 둔다. 활성 상태는 currentColor로 텍스트 색을 그대로 따른다.
const TABS = [
  { href: "/app", label: "자산 목록", icon: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" },
  { href: "/app/settlements", label: "정산 현황", icon: "M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6" },
  {
    href: "/app/settings",
    label: "설정",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  },
] as const;

export function TabBar() {
  const pathname = usePathname();

  const isTabRoute = TABS.some((tab) => tab.href === pathname);
  if (!isTabRoute) return null;

  return (
    <nav
      aria-label="주요 화면"
      className="sticky bottom-0 z-10 grid grid-cols-3 border-t border-border bg-surface"
    >
      {TABS.map((tab) => {
        const isActive = tab.href === pathname;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] ${
              isActive ? "font-semibold text-primary-strong" : "font-medium text-text-muted"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={tab.icon} />
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
