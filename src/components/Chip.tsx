// 출처: Figma "우리몫 디자인 시안 > 컴포넌트 > Chip" — pill 모양 선택 칩(분배 방식, 비용 유형).
// - selected: primary-soft 배경 + 1.5px primary-strong 테두리 + primary-strong 14px medium 글자
// - default: 흰 배경 + border 테두리 + 본문색 13px
// 시안 높이는 40px이지만 최소 터치 타겟 44px을 지키기 위해 min-h-11로 4px 키웠다.
// 마크업(라디오를 감싼 label / aria-pressed 버튼)은 화면마다 다르므로 클래스만 공유한다.
export function chipClassName(selected: boolean, className = "") {
  const state = selected
    ? "border-[1.5px] border-primary-strong bg-primary-soft text-sm leading-5 font-medium text-primary-strong"
    : "border border-border bg-surface text-[13px] leading-[18px] text-text";
  return `flex min-h-11 shrink-0 cursor-pointer items-center rounded-full px-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${state} ${className}`;
}
