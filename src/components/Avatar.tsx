// 출처: Figma "우리몫 디자인 시안 > 컴포넌트 > Avatar" — 32px 원, primary-soft 배경, 이름 첫 글자.
// (목록 화면의 실제 인스턴스는 흰 테두리 없이 8px씩 겹쳐 쓰므로 테두리는 넣지 않았다.)
// 이름이 바로 옆(또는 목록 위)에 텍스트로 함께 있으므로 장식으로 숨긴다.
// 글자: 성을 빼고 이름 첫 글자 — 3글자 이상이면 두 번째 글자(김지민 → 지), 2글자 이하면 첫 글자(지호 → 지).
export function avatarInitial(name: string): string {
  const chars = Array.from(name.trim());
  if (chars.length === 0) return "?";
  return chars.length >= 3 ? chars[1] : chars[0];
}

export function Avatar({ name, text, className = "" }: { name: string; text?: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[13px] leading-[18px] font-medium text-primary-strong ${className}`}
    >
      {text ?? avatarInitial(name)}
    </span>
  );
}

// 목록 카드의 참여자 묶음: 32px 원을 8px씩 겹쳐 한 줄로 보여준다. 스크린리더에는 "참여자 N명" 텍스트가 따로 있다.
// bordered: 회색 카드 위(10·11 종료 완료)·랜딩처럼 겹친 원 사이에 흰 2px 테두리가 있는 시안용.
export function AvatarGroup({ names, max = 5, bordered = false }: { names: string[]; max?: number; bordered?: boolean }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span aria-hidden="true" className="flex items-center -space-x-2">
      {shown.map((name, i) => (
        <Avatar key={`${name}-${i}`} name={name} className={bordered ? "border-2 border-surface" : ""} />
      ))}
      {rest > 0 && <Avatar name="" text={`+${rest}`} className="text-xs" />}
    </span>
  );
}
