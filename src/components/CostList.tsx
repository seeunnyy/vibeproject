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
// 시각: Figma "04 비용 기록 > 비용 목록" — 내역마다 회색 카드(모서리 16px, 패딩 16×14, 간격 8px),
// 첫 줄 유형 · 금액(15px medium), 둘째 줄 날짜 · 부담자 · 메모 + 오른쪽 "삭제"(13px muted).
// 시안은 부담자 이름만 적었지만, 07 요약 시안처럼 "부담자" 라벨을 붙여 누가 낸 돈인지 분명히 한다.
export function CostList({ entries, members, onDelete }: CostListProps) {
  if (entries.length === 0) {
    return <p className="text-[13px] leading-[18px] text-text-muted">아직 기록된 비용이 없어요.</p>;
  }

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "알 수 없음";

  function handleDelete(id: string) {
    if (window.confirm("이 비용 내역을 삭제할까요?")) onDelete(id);
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-1 rounded-2xl bg-surface-muted px-4 pt-3.5 pb-1">
          <p className="flex items-center gap-2 text-[15px] leading-[22px] font-medium text-primary tabular-nums">
            <span className="min-w-0 flex-1">{COST_TYPE_LABEL[entry.type]}</span>
            <span className="shrink-0">{won(entry.amount)}</span>
          </p>
          <div className="flex items-center gap-2 text-[13px] leading-[18px] text-text-muted">
            <p className="min-w-0 flex-1 tabular-nums">
              {entry.date} · 부담자 {nameOf(entry.payerId)}
              {entry.memo && ` · ${entry.memo}`}
            </p>
            <button
              type="button"
              onClick={() => handleDelete(entry.id)}
              aria-label={`${COST_TYPE_LABEL[entry.type]} ${won(entry.amount)} 삭제`}
              className="-mr-1 flex min-h-11 shrink-0 items-center px-1 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              삭제
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
