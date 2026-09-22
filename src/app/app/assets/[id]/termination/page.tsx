"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useAssetStore } from "@/lib/state/AssetStoreProvider";
import { checkContribution } from "@/lib/calc/shares";

// S5 종료 규칙 — 출처: planning/md-design/03_UX_UI_SPEC.md S5
// 근거: FR-7. MVP는 매각만 활성, 인수·폐기는 "다음 버전" 표시(02 부록 A).
export default function TerminationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { assets, mounted, updateAsset } = useAssetStore();
  const asset = assets.find((a) => a.id === id);
  const [note, setNote] = useState(asset?.terminationNote ?? "");
  const [saved, setSaved] = useState(false);

  const contributionCheck = useMemo(
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true }),
    [asset],
  );

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="종료 규칙" backHref="/app" />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-neutral-600">해당 자산을 찾을 수 없어요.</p>
          <Link href="/app" className="text-sm text-neutral-700 underline">
            목록으로 돌아가기
          </Link>
        </main>
      </>
    );
  }

  if (!asset) {
    return (
      <>
        <AppHeader title="종료 규칙" backHref="/app" />
        <main className="flex-1" />
      </>
    );
  }

  if (!contributionCheck.ok) {
    return (
      <>
        <AppHeader title="종료 규칙" backHref={`/app/assets/${asset.id}`} />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-amber-700">
            납부액 합계가 총 구매금액과 달라 종료 규칙을 진행할 수 없어요.
          </p>
          <Link href={`/app/assets/${asset.id}`} className="text-sm text-neutral-700 underline">
            자산 상세에서 납부액 확인하기
          </Link>
        </main>
      </>
    );
  }

  function handleSave() {
    if (!asset) return;
    updateAsset(asset.id, { terminationNote: note.trim() || undefined });
    setSaved(true);
    router.push(`/app/assets/${asset.id}/settlement`);
  }

  return (
    <>
      <AppHeader title="종료 규칙" backHref={`/app/assets/${asset.id}`} />
      <main className="flex flex-1 flex-col gap-5 px-4 py-6">
        <section className="flex flex-col gap-2">
          <div className="rounded-md border border-neutral-900 bg-neutral-900/5 p-3">
            <p className="text-sm font-medium">매각 (선택됨)</p>
            <p className="mt-1 text-xs text-neutral-600">매각가를 입력하면 지분율대로 나눕니다.</p>
          </div>
          <div className="flex flex-col gap-2 opacity-50">
            <div className="flex items-center justify-between rounded-md border border-neutral-200 p-3">
              <span className="text-sm">한 명의 인수</span>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs">다음 버전에서 제공</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-neutral-200 p-3">
              <span className="text-sm">폐기</span>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs">다음 버전에서 제공</span>
            </div>
          </div>
        </section>

        <label htmlFor="termination-note" className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          종료 합의 메모
          <span className="text-xs font-normal text-neutral-500">평가액 산정 기준·특약 등을 자유롭게 적어 주세요 (선택)</span>
          <textarea
            id="termination-note"
            className="min-h-24 rounded-md border border-neutral-300 px-3 py-2 text-base font-normal"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          저장하고 정산으로 이동
        </button>
        {saved && <p className="text-xs text-green-700">저장되었습니다.</p>}
      </main>
    </>
  );
}
