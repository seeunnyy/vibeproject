"use client";

import { useState } from "react";
import { FormField } from "@/components/FormField";
import { NumberInput } from "@/components/NumberInput";
import type { CostEntry, CostType, Member } from "@/lib/types";

const COST_TYPE_OPTIONS: Array<{ value: CostType; label: string }> = [
  { value: "repair", label: "수리비" },
  { value: "purchase", label: "추가 구매비" },
  { value: "shipping", label: "배송비" },
];

export interface CostFormProps {
  members: Member[];
  onAdd: (entry: Omit<CostEntry, "id">) => void;
}

// 출처: 03_UX_UI_SPEC.md §4 — CostForm (S4). 근거: FR-5.
export function CostForm({ members, onAdd }: CostFormProps) {
  const [type, setType] = useState<CostType>("repair");
  const [amount, setAmount] = useState<number | "">("");
  const [payerId, setPayerId] = useState(members[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState("");

  const canSubmit = amount !== "" && amount > 0 && payerId !== "" && date !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({ type, amount: Number(amount), payerId, date, memo: memo.trim() || undefined });
    setAmount("");
    setMemo("");
  }

  return (
    <form className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4" onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-neutral-700">유형</legend>
        <div className="flex gap-2">
          {COST_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                type === opt.value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"
              }`}
            >
              <input
                type="radio"
                name="cost-type"
                value={opt.value}
                checked={type === opt.value}
                onChange={() => setType(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <FormField label="금액" htmlFor="cost-amount" required>
        <NumberInput id="cost-amount" value={amount} onChange={setAmount} min={0} placeholder="20000" />
      </FormField>

      <FormField label="부담자" htmlFor="cost-payer" required>
        <select
          id="cost-payer"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base"
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="날짜" htmlFor="cost-date" required>
        <input
          id="cost-date"
          type="date"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormField>

      <FormField label="메모" htmlFor="cost-memo" hint="선택 입력">
        <input
          id="cost-memo"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </FormField>

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        비용 추가
      </button>
    </form>
  );
}
