// 출처: 03_UX_UI_SPEC.md §4 — NumberInput (금액 입력, 원 단위)
// 입력 중에는 숫자만 받고, 표시는 상위(FormField)의 라벨/에러에 맡긴다.
//
// docs/UX_IMPROVEMENT_PROPOSAL.md #1, #5 반영:
// - type="number" + min={0}만으로는 "-", "e" 같은 문자의 타이핑 자체를 막지 못했다(자가검진에서 실제 확인).
//   type="text" + inputMode="numeric"으로 바꾸고 onChange에서 숫자 외 문자를 모두 제거해 음수·소수·지수
//   표기가 애초에 입력되지 않게 막는다(토스의 "포맷으로 입력 자체를 제어" 원칙).
// - 빈 문자열을 0으로 바꾸지 않고 그대로 상위에 전달한다 — 지우면 "0"으로 스냅되던 마찰을 없앤다.
import { sanitizeDigits } from "@/lib/calc/format";

export interface NumberInputProps {
  id: string;
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  placeholder?: string;
  "aria-describedby"?: string;
}

export function NumberInput({ id, value, onChange, min = 0, placeholder, ...rest }: NumberInputProps) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        const digits = sanitizeDigits(e.target.value);
        onChange(digits === "" ? "" : Number(digits));
      }}
      className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-base text-text focus:ring-2 focus:ring-accent focus:outline-none"
      {...rest}
    />
  );
}
