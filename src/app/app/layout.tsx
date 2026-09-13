import { AssetStoreProvider } from "@/lib/state/AssetStoreProvider";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §2, §5 / design.md D6
// 하위 페이지가 실제로 store 데이터를 렌더링하기 시작하면(다음 슬라이스),
// 각 페이지 뷰를 next/dynamic({ ssr: false })로 감싸는 작업을 추가한다.
// 오늘은 placeholder 텍스트만 렌더하므로 Provider로 감싸는 것까지만 한다.
export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return <AssetStoreProvider>{children}</AssetStoreProvider>;
}
