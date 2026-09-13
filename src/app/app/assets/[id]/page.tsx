import { AppHeader } from "@/components/AppHeader";

// S3 자산 상세 — 출처: planning/md-design/03_UX_UI_SPEC.md S3
// placeholder: 참여자 테이블·지분율·검증 배지·하위 화면 이동은 오늘 범위 밖.
export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <AppHeader title="자산 상세" backHref="/app" />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <p className="text-sm text-neutral-600">자산 상세 화면 준비 중입니다.</p>
        <p className="mt-2 text-xs text-neutral-400">asset id: {id}</p>
      </main>
    </>
  );
}
