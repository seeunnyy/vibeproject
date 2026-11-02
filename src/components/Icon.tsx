// Figma "우리몫 / 컴포넌트 > Icons" 세트를 public/icons/에 그대로 받아 두고 CSS mask로 그린다.
// 파일은 한 가지 색(#0F172A)으로만 export되어 있으므로, 모양은 SVG 파일 그대로 쓰고 색은 mask + bg-current로
// 주변 텍스트 색(currentColor)을 따르게 한다 — 같은 아이콘을 색만 다르게 여러 벌 받아 두지 않기 위함.
// 장식용이므로 항상 aria-hidden. 의미는 옆의 텍스트(또는 버튼의 aria-label)가 전달한다.
export type IconName =
  | "alert"
  | "arrow-left"
  | "check"
  | "chevron-down"
  | "chevron-right"
  | "close"
  | "copy"
  | "plus"
  | "tab-assets"
  | "tab-settlements"
  | "tab-settings";

// Figma는 아이콘을 어떤 크기로 놓든 선 굵기를 1.75px로 유지한다. 24px 파일을 줄여 쓰면 선이 가늘어지므로,
// 시안에서 쓰인 크기별로 Figma가 export한 파일(<name>-<size>.svg)을 따로 받아 두고 있으면 그것을 쓴다.
const SIZED: Partial<Record<IconName, number[]>> = {
  alert: [14, 16],
  check: [14, 16, 18, 26, 36],
  "chevron-right": [18],
  "chevron-down": [20],
  plus: [18],
  "arrow-left": [20],
  close: [20],
};

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className = "" }: IconProps) {
  const file = SIZED[name]?.includes(size) ? `${name}-${size}` : name;
  const url = `url(/icons/${file}.svg)`;
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
