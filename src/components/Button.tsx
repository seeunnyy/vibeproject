import Link from "next/link";

// 출처: Figma "우리몫 디자인 시안 > 컴포넌트 > Button" — 52px 높이 pill(rounded 26px), 15px medium.
// - primary: 남색(--color-primary) — 화면 하단 고정 바의 주 버튼
// - accent: 파랑(--color-primary-strong) — 빈 상태 등 본문 안 강조 버튼
// - secondary: 흰 배경 + 테두리, 남색 글자
// - danger: 흰 배경 + 테두리, 빨간 글자(삭제·초기화)
// disabled는 별도 variant가 아니라 상태다: 어떤 variant든 비활성이면 시안의 style=disabled(회색 배경·muted 글자).
export type ButtonVariant = "primary" | "accent" | "secondary" | "danger";

const BASE =
  "flex min-h-[52px] items-center justify-center gap-1.5 rounded-full px-5 text-[15px] leading-[22px] font-medium focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none disabled:border-transparent disabled:bg-border disabled:text-text-muted";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white",
  accent: "bg-primary-strong text-white",
  secondary: "border border-border bg-surface text-primary",
  danger: "border border-border bg-surface text-error",
};

export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `${BASE} ${VARIANT[variant]} ${className}`;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className = "", type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...rest} />;
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & { variant?: ButtonVariant };

export function ButtonLink({ variant = "primary", className = "", ...rest }: ButtonLinkProps) {
  return <Link className={buttonClassName(variant, className)} {...rest} />;
}

// 화면 하단 고정 액션 바(Figma "bottom-bar": 상단 구분선, 위 13px · 아래 28px 여백 안에 52px 버튼).
// Session 6 구조 그대로 — 바깥 문서는 스크롤되지 않고 430px 카드 안쪽이 스크롤되므로,
// 그 스크롤 컨테이너 기준 sticky bottom-0으로 붙는다.
// row: 버튼 두 개를 같은 폭으로 나란히(Figma 06 정산: 위 12px · 사이 8px).
// borderless: 위 구분선 없음(Figma 10·11 종료 완료: 버튼 두 개를 세로로).
export function BottomBar({
  children,
  row = false,
  borderless = false,
}: {
  children: React.ReactNode;
  row?: boolean;
  borderless?: boolean;
}) {
  return (
    <div
      className={`sticky bottom-0 z-10 flex shrink-0 gap-2 bg-surface px-5 pb-7 ${
        row ? "flex-row pt-3 *:flex-1" : borderless ? "flex-col pt-3" : "flex-col pt-[13px]"
      } ${borderless ? "" : "border-t border-border"}`}
    >
      {children}
    </div>
  );
}
