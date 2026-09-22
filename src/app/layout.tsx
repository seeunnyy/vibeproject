import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리몫",
  description: "공동소유 자산의 지분과 비용을 기록하고 정산하는 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full justify-center bg-app-bg">
        <div className="flex min-h-screen w-full max-w-[430px] flex-col bg-surface text-text shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
