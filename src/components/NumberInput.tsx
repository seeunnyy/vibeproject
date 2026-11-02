// 출처: 03_UX_UI_SPEC.md §4 — NumberInput (금액 입력, 원 단위)
// 입력 중에는 숫자만 받고, 표시는 상위(FormField)의 라벨/에러에 맡긴다.
//
// docs/UX_IMPROVEMENT_PROPOSAL.md #1, #5 반영:
// - type="text" + inputMode="numeric"으로 두고 onChange에서 숫자 외 문자를 모두 제거해 음수·소수·지수
//   표기가 애초에 입력되지 않게 막는다(토스의 "포맷으로 입력 자체를 제어" 원칙).
// - 빈 문자열을 0으로 바꾸지 않고 그대로 상위에 전달한다 — 지우면 "0"으로 스냅되던 마찰을 없앤다.
//
// 시각: Figma "컴포넌트 > Field (unit)" — 입력칸 오른쪽 끝에 "원", 값은 천 단위 콤마로 표시.
// 콤마는 표시용일 뿐이다: 화면에 "900,000"이 보여도 sanitizeDigits가 콤마를 지우므로 상위로는 숫자만 간다.
import { comma, sanitizeDigits } from "@/lib/calc/format";
import { FIELD_BOX } from "@/components/FormField";

export interface NumberInputProps {
  id: string;
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  placeholder?: string;
  unit?: string;
  align?: "left" | "right";
  className?: string;
  autoComplete?: string;
  "aria-describedby"?: string;
}

export function NumberInput({
  id,
  value,
  onChange,
  min = 0,
  placeholder,
  unit = "원",
  align = "left",
  className = "",
  ...rest
}: NumberInputProps) {
  return (
    <div
      className={`flex h-[52px] items-center gap-2 focus-within:ring-2 focus-within:ring-accent ${FIELD_BOX} ${className}`}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        min={min}
        value={value === "" ? "" : comma(value)}
        placeholder={placeholder}
        onChange={(e) => {
          const digits = sanitizeDigits(e.target.value);
          onChange(digits === "" ? "" : Number(digits));
        }}
        className={`h-full w-full min-w-0 flex-1 bg-transparent tabular-nums ${align === "right" ? "text-right" : "text-left"} placeholder:text-text-muted focus:outline-none`}
        {...rest}
      />
      {unit && <span className="shrink-0 font-medium text-text-muted">{unit}</span>}
    </div>
  );
}
