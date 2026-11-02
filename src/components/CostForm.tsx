"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { chipClassName } from "@/components/Chip";
import { FormField, Select, inputClassName } from "@/components/FormField";
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
// 시각: Figma "04 비용 기록 > 새 비용" — 유형 pill 칩, 회색 입력칸, 전체 폭 pill "비용 추가"(비활성 시 회색).
// 시각: Figma "04 비용 기록 > 새 비용" — 유형 pill 칩, 회색 입력칸, 전체 폭 pill "비용 추가"(비활성 시 회색).
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <fieldset className="flex flex-col">
        <legend className="mb-2 text-sm leading-5 font-medium text-text">유형</legend>
        <div className="flex gap-2">
          {COST_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={chipClassName(type === opt.value)}
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
        <NumberInput id="cost-amount" value={amount} onChange={setAmount} min={0} placeholder="20,000" />
      </FormField>

      <FormField label="부담자" htmlFor="cost-payer" required>
        <Select
          id="cost-payer"
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="날짜" htmlFor="cost-date" required>
        <input
          id="cost-date"
          type="date"
          className={inputClassName}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormField>

      <FormField label="메모" htmlFor="cost-memo" hint="선택 입력">
        <input
          id="cost-memo"
          className={inputClassName}
          placeholder="예: 냉각팬 교체"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </FormField>

      <Button type="submit" disabled={!canSubmit}>
        비용 추가
      </Button>
    </form>
  );
}
