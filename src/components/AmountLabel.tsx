import { won } from "@/lib/calc/format";

// 출처: 03_UX_UI_SPEC.md §4 — AmountLabel. 받을 돈은 색이 아니라 부호(+)와 라벨로 표시(AC-13).
export function AmountLabel({ amount }: { amount: number }) {
  return (
    <span className="font-medium text-neutral-900">
      + {won(amount)} <span className="font-normal text-neutral-500">받음</span>
    </span>
  );
}
