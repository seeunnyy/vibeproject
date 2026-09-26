import Link from "next/link";

// 출처: planning/md-design/03_UX_UI_SPEC.md §4 공통 컴포넌트
// docs/DESIGN.md Layout Policy: 3열 그리드로 타이틀 중앙 정렬, 뒤로가기는 44x44 히트영역 아이콘
// + aria-label로 접근성 이름 유지("아이콘 전용 액션 지양" 원칙의 의도적 예외).
//
// closeHref: docs/UX_IMPROVEMENT_PROPOSAL.md #3 — 비용기록/종료규칙/정산/공유요약(S4~S7)처럼
// 여러 단계 안쪽 화면에서 뒤로가기(←, 한 단계씩)와 별개로 최상위로 즉시 벗어나는 닫기(✕)를
// 오른쪽 44px 슬롯에 둔다. 자산 상세(S3)처럼 이미 "자산 목록으로 나가기" 링크가 본문에 있는
// 화면에는 굳이 전달하지 않아도 된다(중복 방지).
export interface AppHeaderProps {
  title: string;
  backHref?: string;
  closeHref?: string;
}

export function AppHeader({ title, backHref, closeHref }: AppHeaderProps) {
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
      {closeHref ? (
        <Link
          href={closeHref}
          aria-label="자산 목록으로 나가기"
          className="flex h-11 w-11 items-center justify-center text-lg"
        >
          <span aria-hidden="true">✕</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </header>
  );
}
