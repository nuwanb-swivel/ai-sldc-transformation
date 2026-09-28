import { expect, test } from "@playwright/test";

test("home page renders the default Next.js scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /To get started, edit the/i }),
  ).toBeVisible();
});
