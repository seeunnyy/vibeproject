import type { Member } from "@/lib/types";
import { won } from "@/lib/calc/format";
import { FormulaText } from "@/components/FormulaText";

export interface MemberTableRow {
  member: Member;
  sharePct: number;
  formula: string;
  paidTotal: number;
  isManager: boolean;
}

// 출처: 03_UX_UI_SPEC.md §4 — MemberTable (S3). <th> 헤더 셀 사용(NFR-5).
export function MemberTable({ rows }: { rows: MemberTableRow[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-neutral-500">
          <th scope="col" className="py-2 font-medium">
            이름
          </th>
          <th scope="col" className="py-2 font-medium">
            지분율
          </th>
          <th scope="col" className="py-2 font-medium">
            납부액
          </th>
          <th scope="col" className="py-2 font-medium">
            낸 비용 합계
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.member.id} className="border-b border-neutral-100">
            <td className="py-2">
              {row.member.name}
              {row.isManager && (
                <span className="ml-1.5 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">관리자</span>
              )}
            </td>
            <td className="py-2">
              {row.sharePct.toFixed(1)}% <FormulaText expr={row.formula} />
            </td>
            <td className="py-2">{won(row.member.contribution)}</td>
            <td className="py-2">{won(row.paidTotal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
