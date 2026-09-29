import { notFound } from "next/navigation";

import { requireSession } from "@/lib/dal/session";

export const dynamic = "force-dynamic";

const MAX_DELAY_MS = 10_000;
const DEFAULT_DELAY_MS = 3_000;

// Test-only diagnostic route. It exists solely so `e2e/loading.spec.ts` can
// deterministically exercise the shared `src/app/loading.tsx` Suspense
// fallback (in particular its `prefers-reduced-motion` treatment) without
// racing the real session-lookup's DB timing or resorting to network
// throttling -- both proved unreliable (the DB round trip is normally too
// fast to observably catch, and CDP-level bandwidth throttling stalled the
// whole browser context for minutes). This route has no own `loading.tsx`,
// so it suspends behind the same root boundary the real app uses. The delay
// is capped and bounded regardless of the requested value.
//
// Guarded so it never does anything in a real deployment: `E2E_DIAGNOSTICS`
// is set only by `playwright.config.ts`'s `webServer.env`, never by a real
// `next start`, so this 404s outside the Playwright-managed test server.
// It also calls `requireSession()` like every other route in this story, so
// reaching it still requires an authoritative (not just proxy-optimistic)
// valid session (AD-2).
export default async function LoadingCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ ms?: string }>;
}) {
  if (process.env.E2E_DIAGNOSTICS !== "1") {
    notFound();
  }

  await requireSession();

  const { ms } = await searchParams;
  const requested = Number(ms);
  const delayMs = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 0), MAX_DELAY_MS)
    : DEFAULT_DELAY_MS;

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  return <p>ok</p>;
}
