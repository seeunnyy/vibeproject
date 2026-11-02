import Link from "next/link";
import { Icon } from "@/components/Icon";

// 출처: Figma "03 자산 상세 > 다음 단계" — 회색 카드(모서리 16px, 좌우 16px · 위아래 4px) 안에
// 행마다 제목(14px medium) + 설명(13px muted) + chevron-right 18px, 행 위아래 14px, 행 사이 구분선.
export interface MenuItem {
  title: string;
  desc: string;
  href: string;
  disabled?: boolean; // 시안에 없는 상태: 진행할 수 없는 단계는 링크 대신 흐린 행으로 둔다.
}

export function MenuList({ items, label }: { items: MenuItem[]; label?: string }) {
  return (
    <nav aria-label={label} className="flex flex-col rounded-2xl bg-surface-muted px-4 py-1">
      {items.map((item, i) => {
        const row = `flex items-center gap-2 py-3.5 ${i < items.length - 1 ? "border-b border-border" : ""}`;
        const body = (
          <>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={`text-sm leading-5 font-medium ${item.disabled ? "text-text-muted" : "text-primary"}`}>{item.title}</span>
              <span className={`text-[13px] leading-[18px] tabular-nums ${item.disabled ? "text-error" : "text-text-muted"}`}>
                {item.desc}
              </span>
            </span>
            <Icon name="chevron-right" size={18} className={item.disabled ? "text-border" : "text-text-muted"} />
          </>
        );
        return item.disabled ? (
          <div key={item.href} aria-disabled="true" className={row}>
            {body}
          </div>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={`${row} focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none`}
          >
            {body}
          </Link>
        );
      })}
    </nav>
  );
}
