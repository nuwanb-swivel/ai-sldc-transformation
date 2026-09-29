- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-data-test-foundation.md`
  summary: Revisit the integration test's `truncate table "user" cascade` isolation strategy once Story 1.2 adds Better-Auth tables with foreign keys to `user`.
  evidence: The cascade currently only touches `user` (no other tables exist yet), so it's harmless today, but once FK tables land, an unqualified `cascade` truncate on every test run will silently wipe rows in those tables too unless the isolation strategy (truncate-all-touched-tables vs. per-test transactions) is reconsidered.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-employee-authenticates-and-reaches-the-app.md`
  summary: Add a rate-limit/lockout policy on repeated failed login attempts once there's an admin-gated route or higher-stakes data behind auth to justify the added complexity.
  evidence: `src/app/(auth)/login/actions.ts` has zero throttling logic today; low current risk for an internal employee tool with no admin surface live yet, but worth closing before the app holds anything more sensitive.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-employee-authenticates-and-reaches-the-app.md`
  summary: Add a `.returning()`/row-count check to `scripts/seed-user.ts`'s role-assignment `db.update().where()` once an admin-gated route exists to make a silently-wrong role observable.
  evidence: The update can match zero rows (e.g. a typo'd `--username`) and the script still logs success; the one concrete trigger theory considered (mixed-case username causing a lookup mismatch) was checked and disproven — Better Auth's `username` plugin normalizes to lowercase on signup regardless of input case — so today's actual risk is low, but the missing check itself is real.
