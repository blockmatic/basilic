import { expect, test } from "@playwright/test";

import { authHelpers } from "./auth-helpers";

test.describe("Logout", () => {
  test("header sign out revokes session and returns to the public board", async ({
    page,
  }) => {
    await authHelpers.loginAsTestUser(page);
    await authHelpers.openAccountMenu(page);
    await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible({
      timeout: 10_000,
    });

    const token = await authHelpers.extractSessionToken(page);
    expect(token).toMatch(/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/);

    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 15_000 })
      .toBe("/");
    await expect(page.getByTestId("header-sign-in")).toBeVisible();

    const authedResponse = await page.request.get(
      `${authHelpers.apiUrl}/test/authed`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(authedResponse.status()).toBe(401);
  });
});
