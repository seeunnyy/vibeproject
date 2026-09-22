import type { CostEntry, CostType, Member } from "@/lib/types";
import { won } from "@/lib/calc/format";

const COST_TYPE_LABEL: Record<CostType, string> = {
  repair: "수리비",
  purchase: "추가 구매비",
  shipping: "배송비",
};

export interface CostListProps {
  entries: CostEntry[];
  members: Member[];
  onDelete: (costId: string) => void;
}

// 출처: 03_UX_UI_SPEC.md §4 — CostList (S4). 최신순, 삭제는 confirm 후.
export function CostList({ entries, members, onDelete }: CostListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-muted">아직 기록된 비용이 없어요.</p>;
  }

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "알 수 없음";

  function handleDelete(id: string) {
    if (window.confirm("이 비용 내역을 삭제할까요?")) onDelete(id);
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm"
        >
          <div>
            <p className="tabular-nums">
              {COST_TYPE_LABEL[entry.type]} · {won(entry.amount)}
            </p>
            <p className="text-xs text-text-muted">
              {entry.date} · 부담자: {nameOf(entry.payerId)}
              {entry.memo && ` · ${entry.memo}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(entry.id)}
            className="flex min-h-11 shrink-0 items-center rounded-xl px-2 text-xs text-text-muted hover:bg-surface-muted"
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  );
}
