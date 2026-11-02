import { ButtonLink } from "@/components/Button";

// 시안에 그려지지 않은 상태(자산을 찾을 수 없음, 납부액 불일치로 진행 불가)를 위한 화면 본문.
// 시안 요소를 재사용: 15px 본문 문구 + secondary pill 버튼(52px).
export function StatusScreen({
  message,
  actionLabel,
  href,
  tone = "muted",
}: {
  message: string;
  actionLabel: string;
  href: string;
  tone?: "muted" | "error";
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-10 text-center">
      <p
        role={tone === "error" ? "alert" : undefined}
        className={`text-[15px] leading-[22px] ${tone === "error" ? "font-medium text-error" : "text-text-muted"}`}
      >
        {message}
      </p>
      <ButtonLink href={href} variant="secondary" className="px-6">
        {actionLabel}
      </ButtonLink>
    </main>
  );
}
