import Link from "next/link";

// 출처: planning/md-design/03_UX_UI_SPEC.md §4 공통 컴포넌트
// docs/DESIGN.md Layout Policy: 3열 그리드로 타이틀 중앙 정렬, 뒤로가기는 44x44 히트영역 아이콘
// + aria-label로 접근성 이름 유지("아이콘 전용 액션 지양" 원칙의 의도적 예외).
export interface AppHeaderProps {
  title: string;
  backHref?: string;
}

export function AppHeader({ title, backHref }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[44px_1fr_44px] items-center bg-primary text-white">
      {backHref ? (
        <Link href={backHref} aria-label="뒤로 가기" className="flex h-11 w-11 items-center justify-center text-xl">
          <span aria-hidden="true">←</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      <h1 className="truncate text-center text-base font-semibold">{title}</h1>
      <span aria-hidden="true" />
    </header>
  );
}
