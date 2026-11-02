// 출처: Figma "우리몫 디자인 시안 > 컴포넌트 > Chip" — pill 모양 선택 칩(분배 방식, 비용 유형).
// - selected: primary-soft 배경 + 1.5px primary-strong 테두리 + primary-strong 14px medium 글자
// - default: 흰 배경 + border 테두리 + 본문색 13px
// 높이는 시안 그대로 40px. 누르는 영역만 ::after로 위아래 2px씩 넓혀 44px을 확보한다(레이아웃 크기는 그대로).
// 마크업(라디오를 감싼 label / aria-pressed 버튼)은 화면마다 다르므로 클래스만 공유한다.
export function chipClassName(selected: boolean, className = "") {
  const state = selected
    ? "border-[1.5px] border-primary-strong bg-primary-soft text-sm leading-5 font-medium text-primary-strong"
    : "border border-border bg-surface text-[13px] leading-[18px] text-text";
  return `relative flex h-10 shrink-0 cursor-pointer items-center rounded-full px-4 after:absolute after:inset-x-0 after:-inset-y-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${state} ${className}`;
}
