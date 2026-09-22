import { test, expect } from "@playwright/test";

// 풀 스펙(FR-1~FR-11) 반영 E2E. Happy Path — 03_UX_UI_SPEC.md §2.1:
// S0 → S1 → S2 → S3 → S4(비용 2건) → S5(매각 확인·합의 메모) → S6(매각가 입력) → S7(복사).

test.describe("자산 생성 → 목록", () => {
  test("등록된 자산이 없으면 빈 상태 안내가 보인다", async ({ page }) => {
    await page.goto("/app");

    await expect(page.getByText("아직 등록한 자산이 없어요")).toBeVisible();
    await expect(page.getByRole("link", { name: "자산 추가" })).toBeVisible();
  });

  test("필수 입력이 없으면 생성이 차단된다", async ({ page }) => {
    await page.goto("/app/assets/new");
    const submit = page.getByRole("button", { name: "자산 만들기" });

    await expect(submit).toBeDisabled();

    await page.getByLabel("물건명").fill("   ");
    await expect(submit).toBeDisabled();

    // Enter로도 제출되지 않아야 한다.
    await page.getByLabel("물건명").press("Enter");
    await expect(page).toHaveURL(/\/app\/assets\/new$/);
  });

  test("납부액 합계가 0이면 생성이 차단된다(R-11)", async ({ page }) => {
    await page.goto("/app/assets/new");
    await page.getByLabel("물건명").fill("공용 냉장고");
    await page.getByLabel("총 구매금액").fill("900000");
    await page.getByPlaceholder("참여자 1 이름").fill("지민");
    await page.getByPlaceholder("참여자 2 이름").fill("세은");

    const submit = page.getByRole("button", { name: "자산 만들기" });
    await expect(submit).toBeDisabled();
  });
});

test.describe("전체 흐름", () => {
  test("생성 → 상세 → 비용 → 종료규칙 → 정산 → 요약", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // S1 → S2
    await page.goto("/app");
    await page.getByRole("link", { name: "자산 추가" }).click();

    // S2 자산 생성 (납부액 모드, 3명, 50/30/20)
    await page.getByLabel("물건명").fill("공용 냉장고");
    await page.getByLabel("총 구매금액").fill("900000");
    await page.getByPlaceholder("참여자 1 이름").fill("지민");
    await page.getByPlaceholder("참여자 2 이름").fill("세은");
    await page.getByRole("button", { name: "참여자 추가" }).click();
    await page.getByPlaceholder("참여자 3 이름").fill("우리");

    await page.getByLabel("지민 납부액").fill("450000");
    await page.getByLabel("세은 납부액").fill("300000");
    await page.getByLabel("우리 납부액").fill("150000");

    await expect(page.getByText("납부액 합계가 총 구매금액과 일치합니다")).toBeVisible();

    await page.getByLabel("관리자").selectOption({ label: "지민" });
    await page.getByLabel("합의 메모").fill("냉장고는 거실에 둔다");

    const submit = page.getByRole("button", { name: "자산 만들기" });
    await expect(submit).toBeEnabled();
    await submit.click();

    // S3 자산 상세
    await expect(page).toHaveURL(/\/app\/assets\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "공용 냉장고" })).toBeVisible();
    await expect(page.getByText("납부액 합계가 총 구매금액과 일치합니다")).toBeVisible();
    await expect(page.getByText("현재 관리자: 지민")).toBeVisible();

    // S4 비용 기록 (2건)
    await page.getByRole("link", { name: "비용 기록" }).click();
    await expect(page).toHaveURL(/\/costs$/);

    await page.getByLabel("금액").fill("20000");
    await page.getByLabel("부담자").selectOption({ label: "지민" });
    await page.getByRole("button", { name: "비용 추가" }).click();

    await page.getByText("배송비", { exact: true }).click();
    await page.getByLabel("금액").fill("5000");
    await page.getByLabel("부담자").selectOption({ label: "세은" });
    await page.getByRole("button", { name: "비용 추가" }).click();

    await expect(page.getByText("전체 합계")).toBeVisible();
    await expect(page.getByText("25,000원")).toBeVisible();

    // S5 종료 규칙
    await page.goBack();
    await page.getByRole("button", { name: "종료·정산" }).click();
    await expect(page).toHaveURL(/\/termination$/);
    await expect(page.getByText("매각 (선택됨)")).toBeVisible();
    await page.getByLabel("종료 합의 메모").fill("평가액은 당근마켓 시세 기준");
    await page.getByRole("button", { name: "저장하고 정산으로 이동" }).click();

    // S6 정산
    await expect(page).toHaveURL(/\/settlement$/);
    await page.getByLabel("매각가").fill("1200000");
    await expect(page.getByText("받을 금액 합계")).toBeVisible();
    await expect(page.getByText("600,000원")).toBeVisible(); // 지민: 1,200,000 × 50.0%

    // S7 요약
    await page.getByRole("link", { name: "요약 보기" }).click();
    await expect(page).toHaveURL(/\/summary$/);
    await expect(page.getByText("종료 규칙: 매각")).toBeVisible();
    await page.getByRole("button", { name: "요약 복사" }).click();
    await expect(page.getByText("복사됨")).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("공용 냉장고");
    expect(clipboardText).toContain("매각가: 1,200,000원");

    // 목록에서도 확인
    await page.goto("/app");
    await expect(page.getByText("공용 냉장고")).toBeVisible();
    await expect(page.getByText("참여자 3명")).toBeVisible();
  });
});
