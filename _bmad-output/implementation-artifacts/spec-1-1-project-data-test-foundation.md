---
title: 'Project Data & Test Foundation'
type: 'chore'
created: '2026-09-28'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md']
baseline_commit: '1c440df403371ff477c09a6e9b38dfe2cd95ed2b'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo has no persistence layer and no test tooling — Vitest and Playwright are still TODOs in `AGENTS.md` — so no later story can persist data or satisfy the Definition of Done.

**Approach:** Wire Drizzle ORM against the existing dockerized Postgres, add a `user` table shaped for Better Auth's later schema extension (Story 1.2), install and wire Vitest (integration tests against real Postgres) and Playwright (placeholder e2e), and uncomment/wire the corresponding CI stages.

## Boundaries & Constraints

**Always:** DB access goes only through `src/lib/db/index.ts`/`schema.ts`. Migrations are generated via `drizzle-kit generate` and committed as SQL under `drizzle/migrations/` — never hand-edited or applied ad hoc. Integration tests run against real Postgres (`postgres:18`, Docker locally / `services:` container in CI) — never mocked or in-memory. `DATABASE_URL` and `BETTER_AUTH_SECRET` are validated via Zod at process start; a missing value throws before the server accepts a request.

**Never:** Do not configure Better Auth itself, `proxy.ts`, or any DAL guard (`lib/dal/**`) — that is Story 1.2. Do not add real feature test coverage yet — Vitest/Playwright get placeholder specs only, proving the harness. Do not add an ESLint import-boundary rule for `lib/db` — out of scope; today it holds vacuously since no importer exists outside `lib/dal/**` yet.

</frozen-after-approval>

## Code Map

- `package.json` -- add `drizzle-orm`, `postgres`, `zod` deps; `drizzle-kit`, `@next/env`, `vitest`, `@playwright/test` devDeps; add `db:generate`/`db:migrate`/`test:integration`/`test:e2e` scripts
- `docker-compose.yml`, `.env.example`, `SETUP.md` -- already scaffolded (Postgres on 1999, `DATABASE_URL`); reuse as-is, add `BETTER_AUTH_SECRET` placeholder, flip SETUP.md's "Status" TODOs to done
- `.github/workflows/ci.yml` -- has stubbed/commented migrate, integration, e2e stages ready to uncomment and rewire; job `env:` already sets `DATABASE_URL`, add `BETTER_AUTH_SECRET`
- `src/app/page.tsx`/`layout.tsx` -- default Next.js scaffold ("Create Next App" title, "To get started..." heading), unmodified; e2e placeholder asserts against it
- `ARCHITECTURE-SPINE.md` -- AD-8/AD-9, Stack table (drizzle-orm/-kit stable line ~0.45/0.31, `postgres:18`), Consistency Conventions (truncate-per-file, no per-test transactions, UUID v4 pks, `snake_case` tables)

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- add the deps/scripts above -- gives every later story a DB client and test runners
- [x] `drizzle.config.ts` -- new: dialect `postgresql`, schema `src/lib/db/schema.ts`, out `drizzle/migrations`, loads `.env.local` via `@next/env`'s `loadEnvConfig` -- lets the CLI run outside the Next runtime
- [x] `src/lib/db/schema.ts` -- new: `role` pgEnum(`employee`,`admin`); `user` table (`id` uuid default-random pk, `username` varchar unique not-null, `role` not-null default `employee`) -- ready for Better Auth's extension in 1.2
- [x] `src/lib/env.ts` -- new: Zod object validating `DATABASE_URL`/`BETTER_AUTH_SECRET`, parsed at import time -- fail-fast startup validation
- [x] `src/lib/db/index.ts` -- new: `postgres()` client + `drizzle()` instance built from `env.DATABASE_URL`, exports `db` -- typed client for the future DAL
- [x] `src/instrumentation.ts` -- new: `register()` imports `src/lib/env.ts` -- runs validation once per server boot
- [x] `drizzle/migrations/` -- new: first migration generated via `drizzle-kit generate` for the `user` table, committed
- [x] `vitest.config.mts` (not `.ts`) -- new: node environment, includes `src/**/*.test.ts` -- `.mts` extension required because Vitest's own ESM-only deps fail to load under Node's CJS config-loading for a `.ts` config in a repo without `"type": "module"`
- [x] `src/lib/db/index.integration.test.ts` -- new: loads env via `@next/env`, inserts+reads a `user` row through `db`, truncates `user` in `afterEach` -- proves the Postgres+Drizzle harness end-to-end
- [x] `playwright.config.ts` -- new: `webServer.command` = `npm run build && npm run start`, `baseURL http://localhost:3000` -- self-contained e2e harness
- [x] `e2e/placeholder.spec.ts` -- new: visits `/`, asserts the existing default page's heading is visible
- [x] `.github/workflows/ci.yml` -- uncomment/rewrite migrate, integration-test, e2e stages in order; add a Playwright browser-install step; add `BETTER_AUTH_SECRET` to job `env:`
- [x] `.env.example`, `SETUP.md` -- add `BETTER_AUTH_SECRET` placeholder; update Status section to reflect Drizzle/Vitest/Playwright now wired

**Acceptance Criteria:**
- Given the Postgres container is healthy, when `npm run db:migrate` runs against `DATABASE_URL`, then the committed migration applies cleanly and creates the `user` table.
- Given `lib/dal/**` does not exist yet, when the repo is searched for imports of `src/lib/db`, then none exist outside that (nonexistent) directory.
- Given `DATABASE_URL` or `BETTER_AUTH_SECRET` is unset, when the app boots (`next dev`/`next start`), then it throws a clear Zod validation error before serving requests.
- Given `npm run test:integration` runs, then it connects to the real Docker Postgres and passes.
- Given `npm run test:e2e` runs, then Playwright builds and starts the app and the placeholder spec passes.
- Given CI runs on a PR, then it executes install → lint → typecheck/build → migrate → integration tests → e2e in order, failing fast at the first red stage.

## Implementation Notes

- `vitest.config.mts` (not `.ts`): Vitest's own ESM-only deps fail to load under Node's default CJS config-loading when the config file is `.ts` in a repo without `"type": "module"`. `.mts` forces ESM loading for that one file without changing the package's module type.
- Added `.env.test` (committed, non-secret placeholder values) and un-ignored it in `.gitignore`: `@next/env`'s `loadEnvConfig` skips `.env.local` whenever `NODE_ENV=test` (confirmed by reading `node_modules/@next/env/dist/index.js`), which Vitest sets automatically — so `npm run test:integration` needs a `.env.test` fallback to find `DATABASE_URL`/`BETTER_AUTH_SECRET` locally. CI doesn't need it since both vars are already set at the job's `env:` level.
- Used `vitest@^4.1.11` rather than the newest `5.x` line: Vitest 5 requires `@types/node@^22`, which conflicts with this repo's pinned `@types/node@^20`. 4.1.11 is the latest line compatible with both; revisit if `@types/node` is later bumped to `^22` (CI's `actions/setup-node` already targets Node 22).
- Independently re-verified (not just per the implementing subagent's report): `npm run lint`, `npm run build`, `npm run db:migrate` (idempotent re-run against the Docker Postgres), `npm run test:integration`, `npm run test:e2e` (after `npx playwright install --with-deps chromium`) all pass; grepped `src/**` and confirmed no import of `lib/db` exists outside `src/lib/db/`; and manually reproduced the fail-fast boot error by removing `.env.local` and starting `next start` with no env vars set — the instrumentation hook throws a `ZodError` naming `BETTER_AUTH_SECRET` and the server returns 500 rather than serving the page.
- **Review patch pass (4 findings, all routed `patch` — see Review Triage Log):** `BETTER_AUTH_SECRET` now requires `.min(32, ...)`; `drizzle.config.ts` sources `DATABASE_URL` from the validated `env` (loaded via `require("./src/lib/env")`, not a static `import`, so it evaluates after `loadEnvConfig()` runs rather than being hoisted above it — a top-level `await import` was tried first but rejected by drizzle-kit's CJS-output esbuild loader); `src/lib/db/index.ts` now exports `client`, and the integration test closes it in `afterAll`; added `src/lib/env.test.ts` asserting a missing `BETTER_AUTH_SECRET` throws. Independently re-verified after patching: `npm run lint`, `npm run build`, `npm run db:migrate`, `npm run test:integration` (2 files, 2 tests), and `npm run test:e2e` all pass; confirmed every existing `BETTER_AUTH_SECRET` placeholder (`.env.local`, `.env.test`, `.env.example`, CI job `env:`) already exceeds 32 characters, so no other file needed a value change.

## Spec Change Log

## Review Triage Log

- **[blind-hunter/edge-case-hunter] `src/lib/env.ts:4-5`** — `BETTER_AUTH_SECRET`/`DATABASE_URL` only checked non-empty, not the "32-char" strength `.env.example` documents. Verdict: `low`. Evidence: confirmed `z.string().min(1, ...)` in both fields; a trivially weak secret passes today, though nothing yet consumes it (Better Auth wiring is Story 1.2). Route: **patch** (trivial, one-line strengthening of a field this story already owns).
- **[blind-hunter/edge-case-hunter] `drizzle.config.ts:11`** — reads `process.env.DATABASE_URL!` directly instead of importing the validated `env` from `src/lib/env.ts`, bypassing the app's own fail-fast validation for the CLI path. Verdict: `low`. Evidence: confirmed by reading the file; a missing `DATABASE_URL` here would surface postgres's raw connection error instead of the intended Zod message. Route: **patch** (trivial: import `env`, use `env.DATABASE_URL`).
- **[blind-hunter/edge-case-hunter] `src/lib/db/index.ts:8`** — the `postgres()` client is created but never exported or closed; the integration test's `afterEach` truncates but never calls `client.end()`. Verdict: `low`. Evidence: confirmed no export/close exists; independently re-ran `npm run test:integration` and it exited cleanly (no observed hang), so the "may hang" framing is speculative, but the resource-management gap itself is real. Route: **patch** (trivial: export `client`, add `afterAll(() => client.end())`).
- **[verification-gap/blind-hunter] `src/lib/env.ts` (whole file)** — no automated test asserts the fail-fast behavior the story's own AC names ("throws a clear Zod validation error"); only manually verified per Implementation Notes. Verdict: `medium` — a named acceptance criterion has zero regression coverage; a later weakening of the schema (e.g. swap to `.safeParse()`) would ship silently green. Route: **patch** (add `src/lib/env.test.ts`).
- **[blind-hunter] `src/lib/db/index.integration.test.ts` truncate/cascade** — hardcoded `truncate table "user" cascade` will also wipe any future Better-Auth tables with FKs to `user` once Story 1.2 adds them; no isolation strategy documented as a considered/rejected alternative. Verdict: `medium` (real, but the affected tables don't exist yet — this story only ever touches `user`). Route: **defer** — not this story's problem; Story 1.2's test author must revisit the truncate/isolation strategy once FK tables exist.
- **[blind-hunter] sprint-status.yaml vs spec frontmatter status mismatch** — Verdict: `false`. Refutation: `sprint-status.yaml`'s `in-progress` reflects the state step-03 wrote before step-04 began; the outer BMAD workflow updates it again at its own defined transition points — this is expected transient process state, not a shipped inconsistency in the codebase.
- **[blind-hunter] `user` table missing `created_at`/`updated_at`** — Verdict: `false`. Refutation: `ARCHITECTURE-SPINE.md`'s Core Entities ER diagram explicitly lists `USER`'s only fields as `id`/`username`/`role` — no timestamps — so the schema matches the specified design, not an oversight.
- **[blind-hunter] no CI cache for Playwright browser install** — Verdict: `low`, rejected. Real but purely a CI-runtime cost; unlikely anyone notices in everyday use, and the fix (an `actions/cache` step with key management) is more than a direct correction.
- **[blind-hunter] `e2e/placeholder.spec.ts` lacks a TODO marker** — Verdict: `low`, rejected. The filename itself (`placeholder.spec.ts`) already self-documents its temporary nature; unlikely to cause real confusion.
- **[blind-hunter] instrumentation hook may need an explicit Next config flag** — Verdict: `false`. Refutation: directly observed during independent verification that removing `.env.local` made `next start` throw "An error occurred while loading instrumentation hook: ZodError..." with no extra flag set; `instrumentation.md`'s version history also shows the hook stable (non-experimental) well before this Next version.
- **[blind-hunter] AGENTS.md's `npx vitest run` DoD gate vs only `test:integration` wired** — Verdict: `false`. Refutation: `epics.md`'s own Story 1.1 AC explicitly permits `npm run test (or an equivalent test:integration script)` — no separate unit-test script was ever required, and no unit-test file exists yet for the broad glob to misclassify.
- **[verification-gap] `playwright.config.ts` webServer rebuilds even though CI already built** — Verdict: `low`, rejected. Real but purely a CI-runtime cost; unlikely to be noticed in everyday use, and the fix (branching the command on `process.env.CI`) is more than a direct correction.

## Verification

**Commands:**
- `npm run lint` -- expected: clean
- `npm run build` -- expected: passes (typecheck + build)
- `docker compose up -d && npm run db:migrate` -- expected: migration applies without error
- `npm run test:integration` -- expected: passes against the Docker Postgres
- `npm run test:e2e` -- expected: Playwright placeholder spec passes
