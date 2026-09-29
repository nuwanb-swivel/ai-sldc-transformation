import { expect, test } from "@playwright/test";

// Requires the same provisioned user as `e2e/login.spec.ts` (see that file's
// comment for how to seed it) -- `proxy.ts` gates every route except
// `/login`, so a valid session cookie is needed to reach the diagnostic
// route below at all.
const TEST_USERNAME = process.env.E2E_TEST_USERNAME ?? "e2e.employee";
const TEST_PASSWORD =
  process.env.E2E_TEST_PASSWORD ?? "correct-horse-battery-staple";

// `src/app/loading.tsx` backs a real Suspense boundary (see that file's
// comment), but the genuine async gap it covers -- a DB-backed session
// lookup -- normally resolves too fast to reliably observe from an e2e test,
// and network-level throttling proved unreliable (it stalls the whole
// browser context, not just the one request).
// `src/app/e2e-diagnostics/loading-check` is a test-only route with a
// controllable, bounded artificial delay and no `loading.tsx` of its own, so
// it suspends behind the exact same shared root fallback deterministically.
test("under prefers-reduced-motion, the loading splash shows one static ~40%-opacity ring and no animated rings", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/login");
  await page.getByLabel("Username").fill(TEST_USERNAME);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/e2e-diagnostics/loading-check?ms=5000", {
    waitUntil: "commit",
  });

  const loadingLabel = page.getByText("Loading TeamPulse…");
  await expect(loadingLabel).toBeVisible();

  const rings = page.locator(
    ".relative.flex.h-\\[200px\\].w-\\[200px\\] > span[aria-hidden='true']",
  );
  await expect(rings).toHaveCount(4);

  const decorative = page.locator(".loading-ring.loading-ring--decorative");
  await expect(decorative).toHaveCount(3);

  for (let i = 0; i < 3; i += 1) {
    const display = await decorative
      .nth(i)
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("none");
  }

  const staticRing = rings.nth(3);
  const staticStyles = await staticRing.evaluate((el) => {
    const computed = getComputedStyle(el);
    return { display: computed.display, opacity: computed.opacity };
  });

  expect(staticStyles.display).toBe("block");
  expect(Number(staticStyles.opacity)).toBeCloseTo(0.4, 1);

  // Let the diagnostic route resolve so the browser context ends this test
  // in a clean, request-settled state.
  await expect(page.getByText("ok")).toBeVisible({ timeout: 10_000 });
});
