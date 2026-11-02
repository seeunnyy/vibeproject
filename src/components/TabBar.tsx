"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";

// 하단 탭바 — 최상위 3개 화면(자산 목록 / 정산 현황 / 설정) 전용 네비게이션.
// 출처: Figma "우리몫 디자인 시안 > 컴포넌트 > TabBar" — 64px, 상단 구분선, 24px 라인 아이콘 + 12px 라벨,
// 활성 탭은 primary-strong + medium, 비활성은 text-muted.
// src/app/app/layout.tsx가 /app 아래 모든 화면(자산 상세 드릴다운 포함)에 공통으로
// 렌더링하므로, 이 컴포넌트가 직접 pathname을 보고 3개 화면 밖에서는 null을 반환한다.
// 자산 상세 이하 드릴다운 화면에는 노출하지 않는다 — 해당 화면은 AppHeader의 뒤로가기/닫기로 이동한다.
const TABS: ReadonlyArray<{ href: string; label: string; icon: IconName }> = [
  { href: "/app", label: "자산 목록", icon: "tab-assets" },
  { href: "/app/settlements", label: "정산 현황", icon: "tab-settlements" },
  { href: "/app/settings", label: "설정", icon: "tab-settings" },
];

export function TabBar() {
  const pathname = usePathname();

  const isTabRoute = TABS.some((tab) => tab.href === pathname);
  if (!isTabRoute) return null;

  return (
    <nav
      aria-label="주요 화면"
      className="sticky bottom-0 z-10 grid h-16 shrink-0 grid-cols-3 border-t border-border bg-surface"
    >
      {TABS.map((tab) => {
        const isActive = tab.href === pathname;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 text-xs leading-4 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none focus-visible:ring-inset ${
              isActive ? "font-medium text-primary-strong" : "text-text-muted"
            }`}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
