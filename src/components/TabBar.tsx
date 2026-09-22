"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 하단 탭바 — 최상위 3개 화면(자산 목록 / 정산 현황 / 설정) 전용 네비게이션.
// src/app/app/layout.tsx가 /app 아래 모든 화면(자산 상세 드릴다운 포함)에 공통으로
// 렌더링하므로, 이 컴포넌트가 직접 pathname을 보고 3개 화면 밖에서는 null을 반환한다.
// 자산 상세 이하 드릴다운 화면(assets/[id], .../costs, .../termination 등)에는
// 노출하지 않는다 — 해당 화면은 AppHeader의 뒤로가기 + "자산 목록으로 나가기"로 이동한다.
const TABS = [
  { href: "/app", label: "자산 목록", icon: "📋" },
  { href: "/app/settlements", label: "정산 현황", icon: "💰" },
  { href: "/app/settings", label: "설정", icon: "⚙️" },
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
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
              isActive ? "text-primary-strong" : "text-text-muted"
            }`}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
