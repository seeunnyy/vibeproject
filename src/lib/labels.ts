import type { Asset, TerminationKind } from "@/lib/types";

// 종료 방식 표시 이름. 화면(05·07·08·10·11)과 복사용 요약 텍스트가 같은 문구를 쓰도록 한 곳에 둔다.
export const TERMINATION_LABEL: Record<TerminationKind, string> = {
  sale: "매각",
  buyout: "한 명의 인수",
  disposal: "폐기",
};

// 인수·폐기로 공동소유를 끝낸 자산인지. 매각은 정산 화면에서 매각가로 마무리하므로 여기 포함하지 않는다.
export function isEnded(asset: Asset): boolean {
  return asset.termination.kind !== "sale" && !!asset.endedAt;
}

// 받침에 따라 조사 고르기: withJosa("공용 냉장고", "을", "를") → "공용 냉장고를".
// "으로/로"는 받침이 없거나 ㄹ 받침이면 "로"(예: "폐기로", "한 명의 인수로").
export function withJosa(word: string, withBatchim: string, withoutBatchim: string): string {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return `${word}${withoutBatchim}`;
  const jong = code % 28;
  const useBatchim = withBatchim === "으로" ? jong !== 0 && jong !== 8 : jong !== 0;
  return `${word}${useBatchim ? withBatchim : withoutBatchim}`;
}
