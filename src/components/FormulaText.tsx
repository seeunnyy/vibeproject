// 출처: 03_UX_UI_SPEC.md §4 — FormulaText (계산 산출식 문자열, NFR-4/FR-9)
export function FormulaText({ expr }: { expr: string }) {
  return <span className="text-xs text-neutral-500">({expr})</span>;
}
