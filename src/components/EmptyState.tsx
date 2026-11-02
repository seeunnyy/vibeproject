// 출처: 03_UX_UI_SPEC.md §4 — EmptyState
export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

import { Button, ButtonLink } from "@/components/Button";

export function EmptyState({ message, actionLabel, onAction, actionHref }: EmptyStateProps) {
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
