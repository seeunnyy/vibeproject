import Link from "next/link";
import { Icon } from "@/components/Icon";

// 출처: Figma "우리몫 디자인 시안 > 컴포넌트 > Header" (type=back / back-close / large)
// - 드릴다운 화면(AppHeader): 흰 배경 64px, 왼쪽 원형 뒤로가기 · 가운데 제목 · 오른쪽 원형 닫기(✕).
//   원형 버튼은 시안대로 40px로 보이되, 터치 영역은 바깥 Link를 44px로 잡아 최소 터치 타겟을 지킨다.
//   (44px 히트영역 안에 40px 원을 가운데 두므로 좌우 패딩을 16px → 14px로 줄여 원의 위치를 시안과 맞춘다.)
// - 탭 화면(LargeHeader): 작은 캡션 + 28px 왼쪽 정렬 큰 제목.
//
// closeHref: docs/UX_IMPROVEMENT_PROPOSAL.md #3 — 비용기록/종료규칙/정산/공유요약(S4~S7)처럼
// 여러 단계 안쪽 화면에서 뒤로가기(←, 한 단계씩)와 별개로 최상위로 즉시 벗어나는 닫기(✕).
// 자산 상세(S3)처럼 본문에 "자산 목록으로 나가기" 링크가 이미 있는 화면에는 전달하지 않는다(중복 방지).
export interface AppHeaderProps {
  title: string;
  backHref?: string;
  closeHref?: string;
}

const CIRCLE_BUTTON =
  "flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none";
const CIRCLE =
  "flex size-10 items-center justify-center rounded-full border border-border bg-surface text-primary";

export function AppHeader({ title, backHref, closeHref }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-surface px-[14px]">
      {backHref ? (
        <Link href={backHref} aria-label="뒤로 가기" className={CIRCLE_BUTTON}>
          <span className={CIRCLE}>
            <Icon name="arrow-left" size={20} />
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="size-11 shrink-0" />
      )}
      <h1 className="min-w-0 flex-1 truncate text-center text-base leading-6 font-bold tracking-[-0.01em] text-primary">
        {title}
      </h1>
      {closeHref ? (
        <Link href={closeHref} aria-label="자산 목록으로 나가기" className={CIRCLE_BUTTON}>
          <span className={CIRCLE}>
            <Icon name="close" size={20} />
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="size-11 shrink-0" />
      )}
    </header>
  );
}

export interface LargeHeaderProps {
  title: string;
  caption?: string;
}

export function LargeHeader({ title, caption }: LargeHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-1 bg-surface px-5 pt-5 pb-2">
      {caption && <p className="text-[13px] leading-[18px] font-medium text-text-muted">{caption}</p>}
      <h1 className="text-[28px] leading-9 font-bold tracking-[-0.02em] text-primary">{title}</h1>
    </header>
  );
}
