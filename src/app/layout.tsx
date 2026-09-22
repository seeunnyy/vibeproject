import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리몫",
  description: "공동소유 자산의 지분과 비용을 기록하고 정산하는 서비스",
};

// 화면 밀림(레이아웃 시프트) 방지: 바깥 문서(html/body)는 항상 뷰포트 높이에 고정하고
// 절대 스크롤되지 않게 한다. 대신 가운데 430px "폰 카드" 안에서만 스크롤되게 하면,
// 탭마다 내용 높이가 달라도(예: 설정 탭이 자산 목록보다 길어짐) 문서 스크롤바가
// 나타났다 사라졌다 하지 않으므로 가운데 정렬된 카드가 좌우로 밀리지 않는다.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex h-dvh justify-center overflow-hidden bg-app-bg">
        <div className="flex h-dvh w-full max-w-[430px] flex-col overflow-y-auto bg-surface text-text shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
