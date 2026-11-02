import type { Member } from "@/lib/types";
import { won } from "@/lib/calc/format";
import { Avatar } from "@/components/Avatar";

export interface MemberTableRow {
  member: Member;
  sharePct: number;
  formula: string;
  paidTotal: number;
  isManager: boolean;
}

// 출처: 03_UX_UI_SPEC.md §4 — MemberTable (S3, S7).
// 시각: Figma 03 "참여자"(참여자마다 회색 카드, 간격 8px) · 07 "참여자·지분"(회색 카드 1개 + 구분선).
// 각 행: 이니셜 원 · 이름(+관리자) · 납부/낸 비용 두 줄 · 오른쪽 20px 지분율.
// 시안 03은 지분율 숫자만 있지만, "계산된 값은 산출식을 함께 보여준다" 원칙에 따라 시안 07처럼
// 지분율 아래에 산출식(예: 400,000 ÷ 900,000)을 12px로 함께 둔다.
// 표(<table>) 대신 목록 + dl로 바꿨다 — 좁은 폭에서 4열 표가 가로 스크롤되던 문제를 없애고,
// 각 값 앞에 "납부"·"낸 비용" 라벨 텍스트를 붙여 열 머리글 없이도 의미가 전달되게 한다.
export function MemberTable({ rows, grouped = false }: { rows: MemberTableRow[]; grouped?: boolean }) {
  return (
    <ul
      className={
        grouped ? "flex flex-col divide-y divide-border rounded-2xl bg-surface-muted px-4 py-1" : "flex flex-col gap-2"
      }
    >
      {rows.map((row) => (
        <li
          key={row.member.id}
          className={`flex items-center gap-3 ${grouped ? "py-3" : "rounded-2xl bg-surface-muted px-4 py-3.5"}`}
        >
          <Avatar name={row.member.name} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="flex items-center gap-1.5">
              <span className="truncate text-[15px] leading-[22px] font-medium text-primary">{row.member.name}</span>
              {row.isManager && <span className="shrink-0 text-xs leading-4 font-medium text-primary-strong">관리자</span>}
            </p>
            <dl className="text-[13px] leading-[18px] text-text-muted tabular-nums">
              <div className="flex gap-1">
                <dt>납부</dt>
                <dd>{won(row.member.contribution)}</dd>
              </div>
              <div className="flex gap-1">
                <dt>낸 비용</dt>
                <dd>{won(row.paidTotal)}</dd>
              </div>
            </dl>
          </div>
          <div className="flex shrink-0 flex-col items-end text-right tabular-nums">
            <span className={`font-medium text-primary ${grouped ? "text-[15px] leading-[22px]" : "text-xl leading-7"}`}>
              <span className="sr-only">지분율 </span>
              {row.sharePct.toFixed(1)}%
            </span>
            <span className="text-xs leading-4 text-text-muted">{row.formula}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
