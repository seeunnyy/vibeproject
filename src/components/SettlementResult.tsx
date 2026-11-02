import type { Member, SettlementResult as SettlementResultType } from "@/lib/types";
import { AmountLabel } from "@/components/AmountLabel";
import { HighlightCard } from "@/components/HighlightCard";
import { Icon } from "@/components/Icon";
import { won } from "@/lib/calc/format";

// 출처: 03_UX_UI_SPEC.md §4 — SettlementResult (S6). 근거: R-4, R-7, FR-9, AC-9, AC-13.
// 시각: Figma 06 "받을 금액" / 07 "정산 결과" — 파란 강조 카드 + 아래 검증 문구.
// 받을 금액은 "+ 금액 받음"(부호 + 라벨)과 산출식 "매각가 × 지분율"을 항상 함께 보여준다.
export function SettlementResult({
  result,
  members,
  title = "받을 금액",
  checkGap = "gap-6",
}: {
  result: SettlementResultType;
  members: Member[];
  title?: string;
  checkGap?: "gap-6" | "gap-3"; // 카드와 검증 문구 사이: 06 정산 24px, 07 공유 요약 12px(시안)
}) {
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "알 수 없음";
  const receiveTotal = result.rows.reduce((t, r) => t + r.receive, 0);

  return (
    <div className={`flex flex-col ${checkGap}`}>
      <HighlightCard
        title={title || undefined}
        rows={result.rows.map((row) => ({
          key: row.memberId,
          label: nameOf(row.memberId),
          value: <AmountLabel amount={row.receive} inverse />,
          sub: row.formula,
        }))}
        total={{ label: "합계", value: won(receiveTotal) }}
      />

      {result.checkOk ? (
        <p className="flex items-start gap-1.5 text-[13px] leading-[18px] text-success">
          <Icon name="check" size={16} className="mt-px" />
          받을 금액 합계({won(receiveTotal)})가 매각가와 일치합니다
        </p>
      ) : (
        <p role="alert" className="flex items-start gap-1.5 text-[13px] leading-[18px] font-medium text-error">
          <Icon name="alert" size={16} className="mt-px" />
          받을 금액 합계 검증에 실패했습니다. 결과를 신뢰할 수 없습니다.
        </p>
      )}
    </div>
  );
}
