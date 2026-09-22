// 출처: planning/md-design/03_UX_UI_SPEC.md §4 공통 컴포넌트 — FormField
// 라벨 + 입력 + 인라인 에러. placeholder로 라벨을 대체하지 않는다(NFR-5).
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
