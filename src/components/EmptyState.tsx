// 출처: 03_UX_UI_SPEC.md §4 — EmptyState
// 두 가지 모양:
// - 기본: 문구 한 줄 + 버튼 (정산 현황 등)
// - 일러스트형(title을 넘기면): Figma "01-0 자산 목록 · 빈 상태"(node 2155:536) — 200px 2.5D 픽토그램 → 16 → 제목(20 bold)
//   → 36 → FAB 모양 버튼 → 16(빈 간격). 남은 높이 안에서 세로 가운데. 시안에 없는 설명·예시 문구는 넣지 않는다.
export interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  illustration?: string;
  title?: string;
}

import { Button, ButtonLink } from "@/components/Button";
import { FabLink } from "@/components/Fab";

export function EmptyState({ message, actionLabel, onAction, actionHref, illustration, title }: EmptyStateProps) {
  if (title) {
    return (
      // main의 위 12px·아래 8px 여백을 감안해 pb-[60px]로 시안(콘텐츠 영역 아래 56px)과 같은 세로 위치에 둔다.
      <div className="flex flex-1 flex-col items-center justify-center px-3 pb-[60px] text-center">
        {illustration && (
          // 장식용 그림이라 대체 텍스트는 비운다. 의미는 바로 아래 제목이 전달한다.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={illustration} alt="" width={200} height={200} className="block size-[200px]" />
        )}
        <h2 className="mt-4 text-xl leading-7 font-bold tracking-[-0.01em] text-primary">{title}</h2>
        {actionLabel && actionHref && <FabLink href={actionHref} label={actionLabel} className="mt-9 mb-4" />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <p className="text-[15px] leading-[22px] text-text-muted">{message}</p>
      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} variant="accent" className="px-6">
          {actionLabel}
        </ButtonLink>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button onClick={onAction} variant="accent" className="px-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
