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
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left text-text-muted">
            <th scope="col" className="px-3 py-2.5 font-medium whitespace-nowrap">
              이름
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium whitespace-nowrap">
              지분율
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium whitespace-nowrap">
              납부액
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium whitespace-nowrap">
              낸 비용
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.member.id} className="border-b border-border last:border-b-0">
              <td className="px-3 py-2.5 whitespace-nowrap">
                {/* 관리자 표시는 pill 대신 이름 아래 보조 텍스트 — 좁은 열에서 "관/리자"로 줄바꿈되던 문제도 해결 */}
                <span className="block">{row.member.name}</span>
                {row.isManager && <span className="block text-xs text-text-muted">관리자</span>}
              </td>
              <td className="px-3 py-2.5 tabular-nums">
                {row.sharePct.toFixed(1)}% <FormulaText expr={row.formula} />
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">{won(row.member.contribution)}</td>
              <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">{won(row.paidTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
