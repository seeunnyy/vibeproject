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
    () => (asset ? checkContribution(asset) : { sum: 0, target: 0, diff: 0, ok: true, hasNegativeMember: false }),
    [asset],
  );

  if (mounted && !asset) {
    return (
      <>
        <AppHeader title="종료 규칙" backHref="/app" />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-text-muted">해당 자산을 찾을 수 없어요.</p>
          <Link href="/app" className="text-sm text-primary-strong underline">
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
        <AppHeader title="종료 규칙" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-amber-700">
            납부액 합계가 총 구매금액과 달라 종료 규칙을 진행할 수 없어요.
          </p>
          <Link href={`/app/assets/${asset.id}`} className="text-sm text-primary-strong underline">
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
      <AppHeader title="종료 규칙" backHref={`/app/assets/${asset.id}`} closeHref="/app" />
      <main className="flex flex-1 flex-col gap-8 px-4 py-6">
        {/* 종료 방식 3개는 하나의 선택지 그룹 — 옵션마다 카드를 만들지 않고 테두리 1개 안에서 구분선으로 나눈다. */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-text">종료 방식</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            <li className="border-l-4 border-l-primary-strong bg-primary-strong/5 px-4 py-3">
              <p className="text-sm font-medium text-text">매각 (선택됨)</p>
              <p className="mt-1 text-xs text-text-muted">매각가를 입력하면 지분율대로 나눕니다.</p>
            </li>
            <li className="flex items-center justify-between px-4 py-3 opacity-50">
              <span className="text-sm text-text">한 명의 인수</span>
              <span className="text-xs text-text-muted">다음 버전에서 제공</span>
            </li>
            <li className="flex items-center justify-between px-4 py-3 opacity-50">
              <span className="text-sm text-text">폐기</span>
              <span className="text-xs text-text-muted">다음 버전에서 제공</span>
            </li>
          </ul>
        </section>

        <label htmlFor="termination-note" className="flex flex-col gap-1 text-sm font-medium text-text">
          종료 합의 메모
          <span className="text-xs font-normal text-text-muted">평가액 산정 기준·특약 등을 자유롭게 적어 주세요 (선택)</span>
          <textarea
            id="termination-note"
            className="min-h-24 rounded-lg border border-border bg-surface px-3 py-2 text-base font-normal text-text focus:ring-2 focus:ring-accent focus:outline-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="flex min-h-11 items-center justify-center rounded-lg bg-primary-strong px-4 text-sm font-medium text-white"
        >
          저장하고 정산으로 이동
        </button>
        {saved && <p className="text-xs text-green-700">저장되었습니다.</p>}
      </main>
    </>
  );
}
