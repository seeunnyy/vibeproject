import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

// S1 자산 목록 — 출처: planning/md-design/03_UX_UI_SPEC.md S1
// placeholder: 실제 목록 렌더링·필터·삭제는 오늘 범위 밖.
export default function AssetListPage() {
  return (
    <>
      <AppHeader title="자산 목록" />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-sm text-neutral-600">자산 목록 화면 준비 중입니다.</p>
        <Link
          href="/app/assets/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          자산 추가
        </Link>
      </main>
    </>
  );
}
