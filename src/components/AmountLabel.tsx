import { won } from "@/lib/calc/format";

// 출처: 03_UX_UI_SPEC.md §4 — AmountLabel. 받을 돈은 색이 아니라 부호(+)와 라벨로 표시(AC-13).
// inverse: 파란 강조 카드(HighlightCard) 위에서 흰 글자로 쓴다. 카드 안 모든 참여자가 같은 모양이라
// 특정 참여자만 튀어 보이지 않는다(DESIGN.md 중립성 원칙).
export function AmountLabel({ amount, inverse = false }: { amount: number; inverse?: boolean }) {
  return (
    <span className={`inline-flex items-baseline gap-1 font-medium tabular-nums ${inverse ? "text-white" : "text-text"}`}>
      + {won(amount)}
      <span className={`text-xs leading-4 font-normal ${inverse ? "text-white" : "text-text-muted"}`}>받음</span>
    </span>
  );
}
