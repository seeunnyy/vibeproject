import type { Member, SettlementResult as SettlementResultType } from "@/lib/types";
import { AmountLabel } from "@/components/AmountLabel";
import { FormulaText } from "@/components/FormulaText";
import { won } from "@/lib/calc/format";

// 출처: 03_UX_UI_SPEC.md §4 — SettlementResult (S6). 근거: R-4, R-7, FR-9, AC-9, AC-13.
export function SettlementResult({ result, members }: { result: SettlementResultType; members: Member[] }) {
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "알 수 없음";

  return (
    <div className="flex flex-col gap-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th scope="col" className="py-2 font-medium">
              이름
            </th>
            <th scope="col" className="py-2 font-medium">
              받을 금액
            </th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => (
            <tr key={row.memberId} className="border-b border-neutral-100">
              <td className="py-2">{nameOf(row.memberId)}</td>
              <td className="py-2">
                <AmountLabel amount={row.receive} /> <FormulaText expr={row.formula} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {result.checkOk ? (
        <p className="flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <span aria-hidden="true">✓</span> 받을 금액 합계({won(result.rows.reduce((t, r) => t + r.receive, 0))})가
          매각가와 일치합니다
        </p>
      ) : (
        <p role="alert" className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          <span aria-hidden="true">⚠</span> 받을 금액 합계 검증에 실패했습니다. 결과를 신뢰할 수 없습니다.
        </p>
      )}
    </div>
  );
}
