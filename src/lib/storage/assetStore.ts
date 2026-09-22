import { EMPTY_STORE, STORAGE_KEY, type StoreSchema } from "@/lib/storage/schema";
import type { Asset, ContributionCheck, CostTotalRow, ShareRow, SettlementResult } from "@/lib/types";
import { won } from "@/lib/calc/format";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §6
// 근거: openspec specs/local-persistence/spec.md

const COST_TYPE_LABEL: Record<Asset["costs"][number]["type"], string> = {
  repair: "수리비",
  purchase: "추가 구매비",
  shipping: "배송비",
};

// 키 읽기 → parse → version 검사. 실패(파싱 불가·형태 불일치)하면 빈 스토어 + loadError: true.
// SSR/테스트(window 없음) 환경에서는 항상 빈 스토어를 loadError 없이 반환한다.
export function load(): { data: StoreSchema; loadError: boolean } {
  if (typeof window === "undefined") {
    return { data: EMPTY_STORE, loadError: false };
  }

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // 저장소 접근 자체가 막힌 환경(일부 프라이빗 모드) — 빈 스토어로 시작.
    return { data: EMPTY_STORE, loadError: true };
  }

  if (raw === null) {
    return { data: EMPTY_STORE, loadError: false };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isStoreSchema(parsed)) {
      return { data: EMPTY_STORE, loadError: true };
    }
    return { data: parsed, loadError: false };
  } catch {
    return { data: EMPTY_STORE, loadError: true };
  }
}

function isStoreSchema(value: unknown): value is StoreSchema {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoreSchema>;
  return candidate.version === 1 && Array.isArray(candidate.assets);
}

// JSON.stringify 후 저장. 예외(QuotaExceededError, 프라이빗 모드 등)는 잡아서 콘솔 경고하고
// 실패 여부를 boolean으로 알려 호출부(Provider)가 "저장되지 않을 수 있음" 배너를 띄우게 한다.
export function save(state: StoreSchema): boolean {
  if (typeof window === "undefined") return true;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("우리몫: localStorage 저장에 실패했습니다.", error);
    return false;
  }
}

export function clear(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("우리몫: localStorage 초기화에 실패했습니다.", error);
  }
}

// S7 "요약 복사"용 평문 텍스트 생성.
export function toSummaryText(
  asset: Asset,
  derived: {
    shares: ShareRow[];
    contribution: ContributionCheck;
    costTotals: CostTotalRow[];
    settlement: SettlementResult | null;
  },
): string {
  const memberName = (id: string) => asset.members.find((m) => m.id === id)?.name ?? "알 수 없음";
  const lines: string[] = [];

  lines.push(`[${asset.name}] 우리몫 요약`);
  lines.push(`총 구매금액: ${won(asset.totalAmount)}`);
  if (asset.purchaseDate) lines.push(`구매일: ${asset.purchaseDate}`);
  lines.push(`관리자: ${asset.managerId ? memberName(asset.managerId) : "미지정"}`);
  if (asset.agreementNote) lines.push(`합의 메모: ${asset.agreementNote}`);
  lines.push("");

  lines.push("참여자별 지분·납부액·낸 비용 합계");
  for (const share of derived.shares) {
    const member = asset.members.find((m) => m.id === share.memberId);
    const paid = derived.costTotals.find((c) => c.memberId === share.memberId)?.paidTotal ?? 0;
    lines.push(
      `- ${member?.name ?? "알 수 없음"}: 지분 ${share.sharePct.toFixed(1)}% (${share.formula}) · 납부액 ${won(
        member?.contribution ?? 0,
      )} · 낸 비용 합계 ${won(paid)}`,
    );
  }
  lines.push(
    derived.contribution.ok
      ? "납부액 합계가 총 구매금액과 일치합니다."
      : `납부액 합계가 총 구매금액과 ${won(Math.abs(derived.contribution.diff))} 차이 있습니다.`,
  );
  lines.push("");

  lines.push("비용 내역");
  if (asset.costs.length === 0) {
    lines.push("- 기록된 비용이 없습니다.");
  } else {
    for (const cost of asset.costs) {
      lines.push(
        `- ${cost.date} ${COST_TYPE_LABEL[cost.type]} ${won(cost.amount)} (부담자: ${memberName(cost.payerId)}${
          cost.memo ? `, ${cost.memo}` : ""
        })`,
      );
    }
  }
  lines.push("");

  lines.push("종료 규칙: 매각");
  if (asset.terminationNote) lines.push(`종료 합의 메모: ${asset.terminationNote}`);
  if (derived.settlement) {
    lines.push(`매각가: ${won(derived.settlement.salePrice)}`);
    for (const row of derived.settlement.rows) {
      lines.push(`- ${memberName(row.memberId)}: + ${won(row.receive)} 받음 (${row.formula})`);
    }
    lines.push(derived.settlement.checkOk ? "받을 금액 합계가 매각가와 일치합니다." : "받을 금액 합계 검증에 실패했습니다.");
  } else {
    lines.push("매각가를 입력하면 정산 결과가 표시됩니다.");
  }

  return lines.join("\n");
}
