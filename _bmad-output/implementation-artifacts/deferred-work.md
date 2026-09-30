- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-data-test-foundation.md`
  summary: Revisit the integration test's `truncate table "user" cascade` isolation strategy once Story 1.2 adds Better-Auth tables with foreign keys to `user`.
  evidence: The cascade currently only touches `user` (no other tables exist yet), so it's harmless today, but once FK tables land, an unqualified `cascade` truncate on every test run will silently wipe rows in those tables too unless the isolation strategy (truncate-all-touched-tables vs. per-test transactions) is reconsidered.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-employee-authenticates-and-reaches-the-app.md`
  summary: Add a rate-limit/lockout policy on repeated failed login attempts once there's an admin-gated route or higher-stakes data behind auth to justify the added complexity.
  evidence: `src/app/(auth)/login/actions.ts` has zero throttling logic today; low current risk for an internal employee tool with no admin surface live yet, but worth closing before the app holds anything more sensitive.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-employee-authenticates-and-reaches-the-app.md`
  summary: Add a `.returning()`/row-count check to `scripts/seed-user.ts`'s role-assignment `db.update().where()` once an admin-gated route exists to make a silently-wrong role observable.
  evidence: The update can match zero rows (e.g. a typo'd `--username`) and the script still logs success; the one concrete trigger theory considered (mixed-case username causing a lookup mismatch) was checked and disproven — Better Auth's `username` plugin normalizes to lowercase on signup regardless of input case — so today's actual risk is low, but the missing check itself is real.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-employee-authenticates-and-reaches-the-app.md`
  summary: Percy UI verification for the login/loading `percySnapshot()` calls is not yet gating CI — confirm visually once the `PERCY_TOKEN` repo secret is added.
  evidence: Per `AGENTS.md`, `PERCY_TOKEN` is still pending human setup; without it Percy no-ops instead of failing the build, so the "UI verification" leg of the Definition of Done for this story hasn't actually run yet.
- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-submit-an-idea.md`
  summary: Add Playwright touch-emulation coverage for the Add Idea overlay's swipe-down-to-dismiss gesture.
  evidence: The grabber's `onTouchStart`/`onTouchMove` handlers have no automated test; exercising them needs a Playwright context with `hasTouch: true`, not currently configured, and the affordance has working alternatives today (outside-tap, close button, Esc), so it isn't blocking.
- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-submit-an-idea.md`
  summary: Give the app's color tokens a real dark-mode pass (most tokens, including the ones this story added, have no dark counterpart).
  evidence: No `prefers-color-scheme` query or `dark:` usage exists anywhere in the app yet — dark mode was never wired up, so this predates and extends beyond this story; worth a dedicated pass once dark mode is actually built.
