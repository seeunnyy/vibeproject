import Link from "next/link";

// 출처: planning/md-design/03_UX_UI_SPEC.md §4 공통 컴포넌트
export interface AppHeaderProps {
  title: string;
  backHref?: string;
}

export function AppHeader({ title, backHref }: AppHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
      {backHref && (
        <Link href={backHref} className="text-sm text-neutral-600">
          ← 뒤로
        </Link>
      )}
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
