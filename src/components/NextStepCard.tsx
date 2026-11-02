import Link from "next/link";
import { Icon } from "@/components/Icon";

// 자산 상세(S3) "다음 할 일" 카드. Figma 03 시안에는 없는 요소라, 시안의 파란 강조 카드
// (02 지분 미리보기 · 06 받을 금액: primary-strong 배경, 모서리 20px, 패딩 20px, 흰 글자)를 그대로 가져와 만들었다.
// 버튼은 카드 위에서 잘 보이도록 흰 배경 + primary-strong 글자 pill(44px)로 둔다.
export interface NextStepCardProps {
  title: string;
  desc: string;
  actionLabel: string;
  href?: string;
  onAction?: () => void;
}

const ACTION =
  "flex min-h-11 items-center justify-center gap-1 self-start rounded-full bg-white px-4 text-sm leading-5 font-medium text-primary-strong focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-strong focus-visible:outline-none";

export function NextStepCard({ title, desc, actionLabel, href, onAction }: NextStepCardProps) {
  return (
    <section aria-labelledby="next-step-title" className="flex flex-col gap-3 rounded-[20px] bg-primary-strong p-5 text-white">
      <div className="flex flex-col gap-1">
        <p className="text-xs leading-4 font-medium">다음 할 일</p>
        <h2 id="next-step-title" className="text-lg leading-[26px] font-bold tracking-[-0.01em]">
          {title}
        </h2>
        <p className="text-[13px] leading-[18px]">{desc}</p>
      </div>
      {href ? (
        <Link href={href} className={ACTION}>
          {actionLabel}
          <Icon name="chevron-right" size={18} />
        </Link>
      ) : (
        <button type="button" onClick={onAction} className={ACTION}>
          {actionLabel}
          <Icon name="chevron-right" size={18} />
        </button>
      )}
    </section>
  );
}
