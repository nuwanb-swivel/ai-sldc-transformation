import { expect, test } from "@playwright/test";

// Requires a provisioned user (`npm run db:seed -- --username <TEST_USERNAME>
// --password <TEST_PASSWORD>`) -- see `.github/workflows/ci.yml`'s "Seed e2e
// test user" step, or run the same command locally before `npm run test:e2e`.
const TEST_USERNAME = process.env.E2E_TEST_USERNAME ?? "e2e.employee";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "correct-horse-battery-staple";

test("logging in with correct credentials lands on the app shell and persists across a refresh", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Username").fill(TEST_USERNAME);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: "You're signed in." }),
  ).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: "You're signed in." }),
  ).toBeVisible();
});

test("an unauthenticated request to a protected route redirects to /login", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL("/login");
});

test("logging in with an incorrect password shows the inline error and retains the username", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Username").fill(TEST_USERNAME);
  await page.getByLabel("Password").fill("definitely-the-wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "Incorrect username or password." }),
  ).toBeVisible();
  await expect(page.getByLabel("Username")).toHaveValue(TEST_USERNAME);
  await expect(page).toHaveURL("/login");
});
