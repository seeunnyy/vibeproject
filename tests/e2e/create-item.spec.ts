import { test, expect } from "@playwright/test";

// 오늘 구현 범위(Goal 1: 제목만 있는 최소 생성/목록 슬라이스)에 대한 E2E.
// 참여자·총구매금액·분배방식을 포함한 풀 스펙 버전(FR-1/AC-1)은
// 등록 폼(tasks.md 5.x)이 실제로 붙으면 이 파일을 확장한다.

test.describe("자산 생성 → 목록", () => {
  test("등록된 자산이 없으면 빈 상태 안내가 보인다", async ({ page }) => {
    await page.goto("/app");

    await expect(page.getByText("아직 등록한 자산이 없어요")).toBeVisible();
    await expect(page.getByRole("link", { name: "자산 추가" })).toBeVisible();
  });

  test("물건명을 입력해 생성하면 목록에 표시된다", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "자산 추가" }).click();

    await page.getByLabel("물건명").fill("공용 냉장고");
    await page.getByRole("button", { name: "자산 만들기" }).click();

    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByText("공용 냉장고")).toBeVisible();
  });

  test("빈/공백 제목이면 생성이 차단된다", async ({ page }) => {
    await page.goto("/app/assets/new");
    const submit = page.getByRole("button", { name: "자산 만들기" });

    await expect(submit).toBeDisabled();

    await page.getByLabel("물건명").fill("   ");
    await expect(submit).toBeDisabled();

    // Enter로도 제출되지 않아야 한다.
    await page.getByLabel("물건명").press("Enter");
    await expect(page).toHaveURL(/\/app\/assets\/new$/);
  });
});
