---
title: 'Employee Authenticates and Reaches the App'
type: 'feature'
created: '2026-09-28'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md']
baseline_commit: '0f87c825be684fa7b71c134d4602f919e2da067d'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no auth: no login, no session, no route protection. Every route and Server Component is currently public, and Story 1.1's `user`/`role` schema has nothing wired to it.

**Approach:** Add Better Auth (credentials + `username` plugin) against the existing Drizzle `user` table, extending it via the Better Auth Drizzle-adapter's own generated tables (`session`/`account`/`verification`) plus username fields. Add `proxy.ts` for optimistic redirect-to-login, a DAL (`requireSession`/`requireAdmin`) as the authoritative guard, a dark-treatment Login screen, a branded Loading splash backing the real session-lookup Suspense boundary, and a seed script for admin-provisioned accounts (no self-registration UI).

## Boundaries & Constraints

**Always:** `lib/db` is imported only from `lib/dal/**` or `lib/auth/index.ts` (Better Auth's own Drizzle adapter wiring) — no other module imports it directly; enforce via an ESLint `no-restricted-imports` rule (it was vacuous in 1.1, non-vacuous now). `proxy.ts` only reads the session cookie (via Better Auth's `getSessionCookie` helper) and redirects — never queries the DB (AD-7). `requireSession()`/`requireAdmin()` in the DAL are the authoritative check, independent of the proxy. The login Server Action returns `{ ok: true; data: T } | { ok: false; error: string }` (NFR-5); `error` is one of a small fixed set of display-ready strings, never a raw exception. Accounts are Admin-provisioned only — never add a public sign-up route/UI.

**Never:** Do not install Better Auth's `admin` plugin — it adds unrelated ban/role concepts on top of our own single `role` column; provisioning goes through a seed script's direct DB update instead. Do not build Epic 2's idea board — the authenticated shell for this story is a minimal placeholder page only. Do not add an artificial minimum/maximum display time to the Loading screen.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy login | Correct username+password for a provisioned user | Session cookie set, redirect into `(app)` shell, session persists across requests | N/A |
| Wrong credentials | Incorrect password or unknown username | Inline error "Incorrect username or password."; username field retains its value | `{ ok: false, error: "Incorrect username or password." }` |
| Direct hit on protected route, no cookie | Unauthenticated GET to `/` (app group) | `proxy.ts` redirects to `/login`, no DB query made | N/A |
| Proxy bypassed (forged/expired cookie reaches a Server Component) | Cookie present but session invalid/expired | `requireSession()` finds no valid session via `auth.api.getSession`, redirects to `/login` | Authoritative DAL rejection, independent of proxy |
| `prefers-reduced-motion` | Media query set during the session-lookup Suspense window | Loading screen shows one static ring at ~40% opacity, no animation loop | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/auth/index.ts` -- new: `betterAuth({ database: drizzleAdapter(db, { provider: "pg", schema }), plugins: [username(), nextCookies()], secret: env.BETTER_AUTH_SECRET, user: { additionalFields: { role: { type: ["employee","admin"], input: false, defaultValue: "employee" } } } })`; only file besides `lib/dal/**` allowed to import `lib/db`
- `src/lib/db/schema.ts` -- extend: run `npx @better-auth/cli generate` against the config above to append `session`/`account`/`verification` tables and the `email`/`name`/`emailVerified`/`username`/`displayUsername` columns Better Auth requires on `user`; keep the existing `role` column as-is. `email`/`name` are internal-only (never in UI/API) — synthesize `email = \`${username}@teampulse.local\``, `name = username` at creation time; document this deviation from the ER diagram inline as a comment.
- `drizzle/migrations/` -- new migration via `npm run db:generate` for the schema above
- `src/lib/dal/session.ts` -- new: `getSession(headersList: Headers)` calls `auth.api.getSession({ headers: headersList })`; `requireSession()` awaits `headers()` (from `next/headers`), calls `getSession`, `redirect('/login')` if none, else returns `{ user, session }`; `requireAdmin()` calls `requireSession()` then `forbidden()` (Next's `forbidden.tsx` convention) if `role !== 'admin'`
- `src/proxy.ts` -- new: `getSessionCookie(request)` from `better-auth/cookies`; if absent and path isn't `/login`, `NextResponse.redirect('/login')`; `export const config = { matcher: [...] }` excluding `/login`, static assets, `/api/auth/**`
- `src/app/(auth)/login/page.tsx` + `login-form.tsx` (`'use client'`) + `actions.ts` -- new: dark/photo treatment per `DESIGN.md`, `AppIcon` (40×40, only here), `useActionState` for the form, error tied to the field via `aria-describedby`
- `src/app/(app)/layout.tsx` + `src/app/(app)/page.tsx` -- new: layout calls `requireSession()`; page is a minimal authenticated placeholder (not Epic 2's idea board)
- `src/app/loading.tsx` -- new: backs the root layout's session-lookup Suspense boundary; pulsing `AppIcon` chip, CSS `@keyframes` only, `prefers-reduced-motion` fallback per `EXPERIENCE.md`
- `src/app/globals.css` -- add the DESIGN.md tokens this story touches (brand-dark, brand-primary, text-inverse/secondary, error-dark tokens, loading-ring keyframes) — not the full design system, only what Login/Loading consume
- `scripts/seed-user.ts` -- new: CLI (`tsx`) accepting username/password/role; calls `auth.api.signUpUsername` then a direct `db.update(user).set({ role })` for the role (bypasses the `input:false` field) — the "DB-action" provisioning mechanism
- `eslint.config.mjs` -- add `no-restricted-imports` for `@/lib/db`/relative equivalents, allowed only in `src/lib/dal/**` and `src/lib/auth/index.ts`
- `package.json` -- add `better-auth@^1.7.6` (dep), `tsx@^4.23.15` (devDep), `db:seed` script

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- add `better-auth`, `tsx`, `db:seed` script
- [x] `src/lib/auth/index.ts` -- Better Auth config (username plugin, `nextCookies()`, additionalFields.role)
- [x] `src/lib/db/schema.ts` + new migration -- Better Auth's required tables/columns, `role` preserved
- [x] `src/lib/dal/session.ts` -- `getSession`, `requireSession`, `requireAdmin`
- [x] `src/proxy.ts` -- optimistic redirect via `getSessionCookie`
- [x] `src/app/(auth)/login/{page,login-form,actions}.tsx` -- login UI + Server Action
- [x] `src/app/(app)/{layout,page}.tsx` -- authenticated placeholder shell
- [x] `src/app/loading.tsx`, `src/app/forbidden.tsx` -- splash + admin-rejection boundary
- [x] `src/app/globals.css` -- scoped design tokens for Login/Loading
- [x] `scripts/seed-user.ts` -- provisioning script
- [x] `eslint.config.mjs` -- `lib/db` import boundary
- [x] `.github/workflows/ci.yml` -- add `BETTER_AUTH_SECRET`-dependent seed step if e2e needs a provisioned user
- [x] `src/lib/dal/session.test.ts`, `src/app/(auth)/login/actions.test.ts` -- integration tests against real Postgres (sign up via seed path, then exercise guards/action)
- [x] `e2e/login.spec.ts` -- replaces the Story 1.1 placeholder: log in, land on `(app)`, refresh persists session; wrong password shows the inline error

**Acceptance Criteria:** (see epics.md Story 1.2 — all seven ACs, reproduced there; not duplicated here to keep this spec within budget)

## Implementation Notes

## Spec Change Log

## Review Triage Log

- **`eslint.config.mjs` `no-restricted-imports` doesn't cover `scripts/seed-user.ts`'s direct `@/lib/db` import** (verification-gap, blind-hunter) — `medium`, verified: rule is `files: ["src/**/*.{ts,tsx}"]`-scoped so `scripts/**` is unchecked, and separately doesn't match dynamic `import()` expressions even inside `src/**` (confirmed both via direct `npx eslint` runs). The frozen boundary ("no other module imports `lib/db` directly... enforce via ESLint") is already violated by this same diff with lint green. → `patch`.
- **`drizzle/migrations/0001_better_auth_tables.sql` adds `name`/`email` as `NOT NULL` with no `DEFAULT`** (blind-hunter, edge-case-hunter) — `low`, verified via the migration SQL; not a live failure today (table is empty pre-migration in every current environment) but a footgun for any future re-run against a seeded table. Fix is a trivial one-line default. → `patch`.
- **`src/proxy.ts` matcher regex both over- and under-excludes paths** (blind-hunter, edge-case-hunter) — `low`, verified: fixed exclusion list misses future `public/` assets (e.g. `robots.txt`); negative lookahead lacks path boundaries so a hypothetical `/login-history` or `/api/authorize` route would bypass the proxy check entirely (mitigated in practice since `requireSession()`/`requireAdmin()` remain the authoritative, proxy-independent guard per the frozen intent). Fix is a trivial regex rewrite. → `patch`.
- **`requireAdmin()` has no success-path test** (blind-hunter) — `low`, verified: `src/lib/dal/session.test.ts`'s only `requireAdmin` case is the non-admin rejection path; no test exercises an actual admin session passing through. No live caller exists yet, but the fix (one more test case) is trivial and the DAL's admin guard is exactly the kind of thing that should be pinned. → `patch`.
- **ESLint `no-restricted-imports` `ignores` covers `**/*.test.ts` but not `**/*.test.tsx`** (edge-case-hunter) — `low`, verified against the exact `ignores` array; no `.test.tsx` file exists yet so no live breakage, but the `files` glob would catch one with no exemption. Trivial one-line addition. → `patch`.
- **Test password `correct-horse-battery-staple` duplicated across `ci.yml` and 2 e2e spec files** (blind-hunter) — `low`, verified 3 exact occurrences; the e2e files already support an `E2E_TEST_PASSWORD` env override that `ci.yml` doesn't use. Trivial to wire ci.yml to the same override. → `patch`.
- **`src/app/e2e-diagnostics/loading-check/page.tsx` ships to production with no environment guard and no `requireSession()` call** (verification-gap, blind-hunter, edge-case-hunter) — `medium`, verified: no `NODE_ENV` check anywhere in the file, no DAL import; reachable by any request whose cookie merely passes `proxy.ts`'s optimistic check (proxy.ts's own comment documents that check as non-authoritative), letting any such caller hold a server request open up to 10s via `?ms=`, and breaking the "DAL is authoritative independent of the proxy" invariant every other route in this story upholds. → `patch`.
- **`scripts/seed-user.ts`'s role-assignment `db.update().where()` has no zero-row check** (verification-gap, edge-case-hunter) — `medium` (real if triggered, e.g. a typo'd `--username`), `low`-current-likelihood: verified no `.returning()`/row-count check exists; the specific mixed-case-username trigger theory blind-hunter proposed is **disproven** (Better Auth's `username` plugin normalizes to lowercase on signup regardless of input case, confirmed in `node_modules/better-auth/dist/plugins/username/index.mjs`), and no admin-gated route exists yet to observe a silently-wrong role. → `defer` (per verification-gap's own filed disposition).
- **No rate-limiting/lockout on repeated failed login attempts** (blind-hunter) — `low`, verified: `src/app/(auth)/login/actions.ts` and its only import have zero throttling logic. Unlikely to be hit in this internal tool's everyday use today, and the fix (attempt counters, lockout policy) is meaningfully more than a direct correction. → `low`, rejected.
- **No dedicated unit test for `src/proxy.ts`** (blind-hunter) — `low`, verified no `proxy.test.ts` exists anywhere; coverage is indirect via e2e only. Behavior is already exercised by `e2e/login.spec.ts`/`e2e/loading.spec.ts`; a dedicated unit test needs non-trivial `NextRequest` mocking for marginal gain. → `low`, rejected.
- **`scripts/seed-user.ts` accepts `--password` as a bare CLI arg** (blind-hunter) — `low`, verified: plain `process.argv` parsing, visible in shell history/`ps`. Internal admin-only tool run by trusted operators; fix (stdin prompt or env var) is more than a direct correction. → `low`, rejected.
- **`e2e/loading.spec.ts` uses brittle Tailwind-class CSS selectors instead of `data-testid`** (blind-hunter) — `low`, verified exact selectors quoted. Test-maintenance nit only — breaks the test on a future restyle, doesn't hide a real regression. Fix (add `data-testid`, update test) is more than trivial. → `low`, rejected.
- **Spec Code Map says the seed script "calls `auth.api.signUpUsername`"** (blind-hunter, edge-case-hunter) — `low`, verified **false as a code defect**: no `signUpUsername` endpoint exists anywhere in this Better Auth version (grepped the package); the actual `signUpEmail` call is correct, and edge-case-hunter's follow-on claim that it skips username validation is also **disproven** — the username plugin's `create.before` hook validates format/length unconditionally regardless of which sign-up endpoint is hit. The Code Map text itself is inaccurate, but the only fix is editing this spec, which triage fixes may not do. → rejected (fix would be a spec edit).
- **`docs/paneo-active-sprint-gap.md` and the `sprints:` bridge block in `sprint-status.yaml`** (blind-hunter) — verified via `git show` against `baseline_commit`: both predate this story's implementation work entirely (present as uncommitted changes in the working tree before this build session started). Not caused by this story. → `defer` (not this story's problem; flagged to the human to keep out of this story's commit rather than logged as new deferred work).

## Design Notes

- **Email/name synthesis:** Better Auth's core (even with the `username` plugin) requires `email`+`name` on `user`. The ER diagram in `ARCHITECTURE-SPINE.md` doesn't show them. Decision: add them as internal, server-owned, never-surfaced columns (`email` derived from `username`) rather than hand-rolling password hashing/session management ourselves — reimplementing what Better Auth exists to provide would contradict AD's own rationale for picking it.
- **Why not the `admin` plugin:** it introduces its own ban/impersonation/role vocabulary that overlaps and conflicts with our single `role` enum (AD-8: one identity source, no parallel role system). A seed script with a direct `db.update` is simpler and keeps `role` the only source of truth.
- **Why `getSession(headersList: Headers)` takes an explicit param instead of calling `headers()` internally:** makes it callable from Vitest without a Next.js request context — a test can build a `Headers` with a real cookie obtained from `auth.api.signInUsername` and call the DAL function directly, matching Story 1.1's "real Postgres, no mocks" convention.
- **Loading screen is real, not decorative:** the root layout's session lookup (`getSession` → `auth.api.getSession` → Postgres) is a genuine async gap, so `src/app/loading.tsx` backs a real Suspense boundary — consistent with the epic-context note that Loading must never fake a client-side auth race.

## Verification

**Commands:**
- `npm run lint` -- expected: clean, including the new import-boundary rule
- `npm run build` -- expected: passes (typecheck + build)
- `npm run db:migrate` -- expected: new Better Auth migration applies cleanly
- `npm run test:integration` -- expected: DAL guard + login action tests pass against Docker Postgres
- `npm run test:e2e` -- expected: `e2e/login.spec.ts` passes (requires a seeded user; seed via `npm run db:seed` in the test setup/CI step)
- `npm run db:seed -- --username test.employee --password <pw> --role employee` -- expected: row created in `user` with `role = 'employee'`
