// 출처: Figma "09 설정 > 우리몫 이용 방법" — 왼쪽 레일(24px 번호 원 + 2px 세로선), 14px 간격,
// 제목 14px medium + 설명 13px muted, 항목 사이 20px.
export interface TimelineStep {
  title: string;
  desc: string;
}

export function StepTimeline({ steps, label }: { steps: ReadonlyArray<TimelineStep>; label?: string }) {
  return (
    <ol aria-label={label} className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.title} className="flex gap-3.5">
            <div aria-hidden="true" className="flex w-6 shrink-0 flex-col items-center">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs leading-4 font-medium text-primary-strong">
                {index + 1}
              </span>
              {!isLast && <span className="w-0.5 flex-1 rounded-[1px] bg-border" />}
            </div>
            <div className={`flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5 ${isLast ? "" : "pb-5"}`}>
              <span className="text-sm leading-5 font-medium text-primary">{step.title}</span>
              <span className="text-[13px] leading-[18px] text-text-muted">{step.desc}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
