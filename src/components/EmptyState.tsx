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
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-neutral-600">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
