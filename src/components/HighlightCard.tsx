// 출처: Figma 02 "지분 미리보기" · 06 "받을 금액" · 07 "정산 결과" — 파란 강조 카드.
// primary-strong 배경, 모서리 20px, 패딩 20px, 행 간격 14px, 흰 글자(대비 ~6.3:1, AA).
// 각 행: 왼쪽 이름(15px) / 오른쪽 값(15px medium) + 산출식(12px). 합계가 있으면 accent 1px 구분선 아래에 둔다.
// 계산된 값은 반드시 sub(산출식)를 함께 넘겨 "어떻게 나온 값인지"를 보여준다(DESIGN.md UI Rules).
export interface HighlightRow {
  key: string;
  label: string;
  value: React.ReactNode;
  sub?: string;
}

export interface HighlightCardProps {
  title?: string;
  aside?: string;
  rows: HighlightRow[];
  total?: { label: string; value: string };
}

export function HighlightCard({ title, aside, rows, total }: HighlightCardProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-[20px] bg-primary-strong p-5 text-white">
      {(title || aside) && (
        <div className="flex items-center justify-between gap-3">
          {title && <p className="text-[15px] leading-[22px] font-medium">{title}</p>}
          {aside && <p className="text-xs leading-4">{aside}</p>}
        </div>
      )}
      <dl className="flex flex-col gap-3.5 tabular-nums">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2">
            <dt className="min-w-0 flex-1 truncate text-[15px] leading-[22px]">{row.label}</dt>
            <dd className="flex shrink-0 flex-col items-end text-right whitespace-nowrap">
              <span className="text-[15px] leading-[22px] font-medium">{row.value}</span>
              {row.sub && <span className="text-xs leading-4">{row.sub}</span>}
            </dd>
          </div>
        ))}
        {total && (
          <div className="flex items-center border-t border-accent pt-3.5 text-[15px] leading-[22px]">
            <dt className="flex-1">{total.label}</dt>
            <dd className="font-medium">{total.value}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
