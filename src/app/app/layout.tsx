import { AssetStoreProvider } from "@/lib/state/AssetStoreProvider";
import { TabBar } from "@/components/TabBar";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §2, §5 / design.md D6
// TabBar는 /app 아래 모든 화면에 공통으로 렌더링되지만, 컴포넌트 자신이 pathname을 보고
// 최상위 3개 탭(자산 목록/정산 현황/설정) 밖에서는 null을 반환해 자산 상세 드릴다운
// 화면에는 노출되지 않는다 (src/components/TabBar.tsx 참고).
export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AssetStoreProvider>
      {children}
      <TabBar />
    </AssetStoreProvider>
  );
}
