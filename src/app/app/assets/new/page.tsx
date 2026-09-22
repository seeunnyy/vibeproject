"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";

// S2 자산 생성 — 출처: planning/md-design/03_UX_UI_SPEC.md S2
// 최소 슬라이스: 물건명(제목)만 입력받아 생성한다. 나머지 필드는 이후 작업(5.1)에서 추가.
export default function NewAssetPage() {
  const router = useRouter();
  const { createAsset } = useAssetStore();
  const [name, setName] = useState("");

  const canSubmit = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    createAsset(name);
    router.push("/app");
  }

  return (
    <>
      <AppHeader title="자산 만들기" backHref="/app" />
      <main className="flex flex-1 flex-col gap-4 px-4 py-10">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            물건명
            <input
              className="rounded-md border border-neutral-300 px-3 py-2 text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 공용 냉장고"
            />
          </label>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            자산 만들기
          </button>
        </form>
      </main>
    </>
  );
}
