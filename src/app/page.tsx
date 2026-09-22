import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-primary px-6 py-16 text-center text-white">
      <h1 className="text-3xl font-bold">우리몫</h1>
      <p className="max-w-md text-base text-white/85">
        공동소유 자산의 지분과 비용을 기록하고, 합의된 규칙에 따라 공동소유를 종료하는 모바일
        웹 서비스예요.
      </p>
      <ul className="max-w-md space-y-1 text-left text-sm text-white/75">
        <li>· 지분·부담이 불명확해서 나중에 확인하기 어려워요</li>
        <li>· 추가 비용 기록이 누락돼 재계산이 어려워요</li>
        <li>· 종료 규칙을 미리 정하지 않아 정산 갈등이 생겨요</li>
      </ul>
      <Link
        href="/app"
        className="flex min-h-11 items-center rounded-xl bg-white px-6 text-sm font-medium text-primary-strong"
      >
        시작하기
      </Link>
    </main>
  );
}
