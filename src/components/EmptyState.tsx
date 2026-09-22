// 출처: 03_UX_UI_SPEC.md §4 — EmptyState
export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

import Link from "next/link";

export function EmptyState({ message, actionLabel, onAction, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <p className="text-sm text-text-muted">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="flex min-h-11 items-center rounded-xl bg-primary-strong px-5 text-sm font-medium text-white"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="flex min-h-11 items-center rounded-xl bg-primary-strong px-5 text-sm font-medium text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
