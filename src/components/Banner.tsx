// 출처: 03_UX_UI_SPEC.md §4 — Banner (경고/오류 배너). 스크린리더 전달을 위해 role="alert".
export interface BannerProps {
  tone: "warn" | "error";
  message: string;
  action?: { label: string; onClick: () => void };
}

export function Banner({ tone, message, action }: BannerProps) {
  const toneClass =
    tone === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-amber-300 bg-amber-50 text-amber-800";

  return (
    <div role="alert" className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      <span>{message}</span>
      {action && (
        <button type="button" onClick={action.onClick} className="flex min-h-11 shrink-0 items-center px-2 underline">
          {action.label}
        </button>
      )}
    </div>
  );
}
