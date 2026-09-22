// 출처: 03_UX_UI_SPEC.md §4 — NumberInput (금액 입력, 원 단위)
// 입력 중에는 숫자만 받고, 표시는 상위(FormField)의 라벨/에러에 맡긴다.
export interface NumberInputProps {
  id: string;
  value: number | "";
  onChange: (value: number) => void;
  min?: number;
  placeholder?: string;
  "aria-describedby"?: string;
}

export function NumberInput({ id, value, onChange, min = 0, placeholder, ...rest }: NumberInputProps) {
  return (
    <input
      id={id}
      type="number"
      inputMode="numeric"
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === "" ? 0 : Number(raw));
      }}
      className="rounded-md border border-neutral-300 px-3 py-2 text-base"
      {...rest}
    />
  );
}
