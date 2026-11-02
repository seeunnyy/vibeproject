// 출처: Figma "우리몫 디자인 시안" 공통 섹션 제목 행(title-row) — 16px bold primary 제목,
// 오른쪽에 13px muted 보조 정보(예: "3명", "2건", "매각가 450,000원").
export function SectionHeader({ title, aside, id }: { title: string; aside?: React.ReactNode; id?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="text-base leading-6 font-bold tracking-[-0.01em] text-primary">
        {title}
      </h2>
      {aside && <span className="text-[13px] leading-[18px] text-text-muted tabular-nums">{aside}</span>}
    </div>
  );
}
