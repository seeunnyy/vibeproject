import { Icon } from "@/components/Icon";

// 출처: planning/md-design/03_UX_UI_SPEC.md §4 공통 컴포넌트 — FormField
// 시각: Figma "우리몫 디자인 시안 > 컴포넌트 > Field / Textarea" — 14px medium 라벨, 8px 간격,
// surface-muted 배경 52px 입력(모서리 12px, 좌우 16px), 12px muted 도움말.
// 라벨-입력 연결은 그대로: placeholder로 라벨을 대체하지 않는다(NFR-5).
export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, required, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm leading-5 font-medium text-text">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs leading-4 text-text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs leading-4 text-error">
          {error}
        </p>
      )}
    </div>
  );
}

// 텍스트·날짜 입력, 셀렉트, 텍스트영역이 같은 모양을 쓰도록 클래스를 공유한다.
export const FIELD_BOX =
  "rounded-xl bg-surface-muted px-4 text-[15px] leading-[22px] text-text placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:outline-none";

export const inputClassName = `h-[52px] w-full ${FIELD_BOX}`;

export const textareaClassName = `min-h-28 w-full resize-y py-3.5 ${FIELD_BOX}`;

// 기본 화살표 대신 시안의 chevron-down(20px, muted)을 오른쪽에 둔다.
export function Select({ className = "", ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select className={`${inputClassName} appearance-none pr-11`} {...rest} />
      <Icon
        name="chevron-down"
        size={20}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
}
