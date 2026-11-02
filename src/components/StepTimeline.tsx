import Link from "next/link";
import { Icon } from "@/components/Icon";

// 출처: Figma "09 설정 > 우리몫 이용 방법" — 왼쪽 레일(24px 번호 원 + 2px 세로선), 14px 간격,
// 제목 14px medium + 설명 13px muted, 항목 사이 20px.
// 자산 상세(S3) "진행 단계"도 같은 모양을 재사용하되 state로 진행 상태를 표시한다:
// - done: primary-strong 원 + 흰 체크, 설명 옆 "완료" 텍스트
// - current: primary-soft 원 + 파란 번호(시안 기본 모양), 제목 옆 "지금 할 일"
// - todo / 미지정: 시안 기본 모양(primary-soft 원 + 파란 번호)
// - locked: surface-muted 원 + muted 번호, 제목도 muted (선행 단계가 막혀 아직 못 하는 단계)
// 색만으로 구분하지 않도록 done/current/locked는 텍스트 표시를 함께 둔다.
export type StepState = "done" | "current" | "todo" | "locked";

export interface TimelineStep {
  title: string;
  desc: string;
  state?: StepState;
  href?: string;
}

export function StepTimeline({ steps, label }: { steps: ReadonlyArray<TimelineStep>; label?: string }) {
  return (
    <ol aria-label={label} className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const state = step.state ?? "todo";
        const body = (
          <>
            <span className="flex items-center gap-1.5">
              <span
                className={`text-sm leading-5 font-medium ${state === "locked" ? "text-text-muted" : "text-primary"}`}
              >
                {step.title}
              </span>
              {state === "current" && (
                <span className="text-xs leading-4 font-medium text-primary-strong">지금 할 일</span>
              )}
              {state === "done" && <span className="text-xs leading-4 text-text-muted">완료</span>}
              {state === "locked" && <span className="text-xs leading-4 text-text-muted">아직 못 해요</span>}
            </span>
            <span className="text-[13px] leading-[18px] text-text-muted">{step.desc}</span>
          </>
        );

        return (
          <li key={step.title} className="flex gap-3.5">
            <div aria-hidden="true" className="flex w-6 shrink-0 flex-col items-center">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs leading-4 font-medium ${
                  state === "done"
                    ? "bg-primary-strong text-white"
                    : state === "locked"
                      ? "bg-surface-muted text-text-muted"
                      : "bg-primary-soft text-primary-strong"
                }`}
              >
                {state === "done" ? <Icon name="check" size={14} /> : index + 1}
              </span>
              {!isLast && <span className="w-0.5 flex-1 rounded-[1px] bg-border" />}
            </div>
            {step.href && state !== "locked" ? (
              <Link
                href={step.href}
                className={`flex min-h-11 min-w-0 flex-1 items-start justify-between gap-2 pt-0.5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${isLast ? "" : "pb-5"}`}
              >
                <span className="flex min-w-0 flex-col gap-0.5">{body}</span>
                <Icon name="chevron-right" size={18} className="mt-0.5 text-text-muted" />
              </Link>
            ) : (
              <div className={`flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5 ${isLast ? "" : "pb-5"}`}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
