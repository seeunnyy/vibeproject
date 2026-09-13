import { AppHeader } from "@/components/AppHeader";

// S2 자산 생성 — 출처: planning/md-design/03_UX_UI_SPEC.md S2
// placeholder: 실제 폼 입력·검증·제출은 오늘 범위 밖.
export default function NewAssetPage() {
  return (
    <>
      <AppHeader title="자산 만들기" backHref="/app" />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <p className="text-sm text-neutral-600">자산 생성 폼 준비 중입니다.</p>
      </main>
    </>
  );
}
