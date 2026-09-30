import { expect, test } from "@playwright/test";

// Requires a provisioned user, same as `e2e/login.spec.ts` -- see that
// file's comment for the `npm run db:seed` setup step.
const TEST_USERNAME = process.env.E2E_TEST_USERNAME ?? "e2e.employee";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "correct-horse-battery-staple";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill(TEST_USERNAME);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
});

test("Submit stays disabled until both fields are filled, then submitting closes the overlay silently", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Idea" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const submit = page.getByRole("button", { name: "Submit idea" });
  await expect(submit).toBeDisabled();

  await page.getByLabel("Title").fill("Give the coffee machine a service rota");
  await expect(submit).toBeDisabled();

  await page
    .getByLabel("Description")
    .fill("It keeps breaking mid-morning and nobody owns fixing it.");
  await expect(submit).toBeEnabled();

  await submit.click();

  await expect(dialog).toBeHidden();
});

test("dismissing with Esc discards the typed content with no confirm dialog", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Add Idea" });
  await trigger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await page.getByLabel("Title").fill("An idea I will abandon");
  await page.getByLabel("Description").fill("Some description text.");

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue("");
  await expect(page.getByLabel("Description")).toHaveValue("");
});

test("dismissing with an outside tap discards the typed content", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Idea" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await page.getByLabel("Title").fill("An idea I will abandon");
  await page.getByLabel("Description").fill("Some description text.");

  // Click the dialog element itself, outside the card, so it lands on the
  // backdrop and triggers handleBackdropClick's dismiss.
  await dialog.click({ position: { x: 5, y: 5 } });

  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "Add Idea" }).click();
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue("");
  await expect(page.getByLabel("Description")).toHaveValue("");
});
