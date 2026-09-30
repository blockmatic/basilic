import { expect, test } from "@playwright/test";

test.describe("Dashboard routes", () => {
  test("home shows the welcome screen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("welcome")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("welcome")).toContainText(
      "Welcome to Basilic. Your application is ready."
    );
  });

  test("status command renders the status card", async ({ page }) => {
    await page.goto("/?q=show+application+status&surface=status");
    await expect(page.getByTestId("status-card")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("account command asks a signed-out visitor to sign in", async ({
    page,
  }) => {
    await page.goto("/?q=show+my+account&surface=account");
    await expect(page.getByTestId("auth-required")).toBeVisible({
      timeout: 15_000,
    });
  });
});
