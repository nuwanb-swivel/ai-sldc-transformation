# Epic 1 Context: Authentication & Foundation

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Employees must be able to log in with a username and password and land on a protected, authenticated app shell; anyone unauthenticated is blocked from every route and API. This epic also lays the project foundation everything else builds on: Postgres wired via Drizzle, Better Auth configured with a `role`-bearing user record, the DAL's session/role guards, the optimistic-redirect proxy, the Server Action return-shape convention, and installing/wiring the test tooling (Vitest, Playwright) still marked TODO in `AGENTS.md`. Nothing in Epic 2 (idea board) can be safely built without this foundation in place.

## Stories

- Story 1.1: Project Data & Test Foundation
- Story 1.2: Employee Authenticates and Reaches the App

## Requirements & Constraints

- A person must authenticate with username/password before accessing any feature; all routes and API endpoints require an authenticated session; unauthenticated web requests redirect to login, API requests are rejected. Accounts are Admin-provisioned only — no self-registration UI. SSO/SAML/OAuth/MFA are out of scope; a full password-reset flow is deferred beyond a minimal assumption.
- Exactly two roles exist (`employee`, `admin`); no per-idea ownership or approval workflow layered on top.
- WCAG 2.2 AA is the floor: relevant to this epic — Login/Loading screens must be accessible (proper labeling, focus handling), and form errors are associated with their field via `aria-describedby`.
- Every Server Action returns a discriminated union (`{ ok: true; data: T } | { ok: false; error: string }`); `error` is short, display-ready copy from a small fixed set of cases (not-found, forbidden, validation, unexpected) — never a raw exception or stack; the real cause is server-logged only, keyed by a request id.
- Definition of Done for every story: lint (`npm run lint`), build/typecheck (`npm run build`), plus — once scaffolded in this epic — unit tests (Vitest against a real disposable Postgres), functional/e2e tests (Playwright), and later Percy UI verification. Installing/wiring this tooling is itself in-scope implementation work, not an assumed precondition.

## Technical Decisions

- Layered architecture enforced by convention: Presentation (Server/Client Components) → Server Actions (mutation boundary) → DAL (auth-checked reads/writes) → Persistence (Postgres). Mutations go through Server Actions only — no Route Handlers for mutations.
- Authorization lives only in the DAL: every Server Action and every Server Component reading protected data calls a DAL guard (`requireSession()`, `requireAdmin()`) that performs both the auth check and the read/write in one place. `lib/db` is importable only from `lib/dal/**`. UI hiding of controls is a convenience layer, never the enforcement point.
- `proxy.ts` (the App Router's renamed `middleware.ts`) is optimistic-only: it reads the session cookie and redirects unauthenticated requests to `/login`, and never queries the database or makes a role decision. The DAL remains the authoritative rejection point even if a request somehow bypasses the proxy.
- `role` (`employee` | `admin`) lives as a field on the auth library's own user record (schema-extended for Better Auth), set only via direct admin provisioning (seed or DB action) — no parallel allowlist or separate roles table.
- Better Auth is the chosen auth library (credentials provider), configured against the Drizzle-backed `user` table.
- Since the proxy+DAL resolve auth server-side before first paint, there is no client-side session race for the Loading screen to cover — it should only back genuine data-fetch Suspense boundaries (e.g. a route's `loading.tsx`), not an auth-resolution phase.
- `cacheComponents` stays off; no cache directives anywhere — freshness comes from `revalidatePath` in Server Actions (relevant once mutations exist in Epic 2, but the convention is set here).
- DB: Drizzle ORM against Postgres (Docker locally on port 1999, pinned to `postgres:18`). `drizzle-kit generate` commits SQL migrations to the repo; `drizzle-kit migrate` runs as a required deploy-pipeline step, never by hand against production. Primary keys are UUID v4; timestamps `timestamptz`, ISO 8601 UTC at the API boundary; DB tables `snake_case` plural (`user`), TS types `PascalCase` singular.
- Env vars (`DATABASE_URL`, Better Auth secret) are validated at startup via a schema (e.g. Zod) so a missing value fails fast in dev, not mid-request in prod.
- Source tree for this epic: `src/app/(auth)/login/page.tsx`, `src/app/(app)/layout.tsx` (authenticated shell, calls DAL for session), `src/lib/db/{schema.ts,index.ts}`, `src/lib/dal/session.ts` (`requireSession()`, `requireAdmin()`), `src/lib/auth/index.ts` (Better Auth config), `src/proxy.ts`.
- Testing convention: DAL functions and Server Actions are unit-tested via integration tests against a real disposable Postgres (Docker locally, GitHub Actions `services:` container in CI, both pinned to `postgres:18`) — never a mock or in-memory emulator; migrations run once per container/job start, then each test file truncates the tables it touches. Playwright will cover the five FR journeys end-to-end before release; this epic only needs a minimal placeholder e2e spec proving the harness is wired.
- Reuse existing scaffolded infra rather than recreating it: `docker-compose.yml` (Postgres 18, host port 1999, named volume, `pg_isready` healthcheck), `.github/workflows/ci.yml` (install → lint → typecheck stages already live; DB/integration/e2e stages currently stubbed/commented, to be uncommented and wired here), `SETUP.md`, `.env.example`.

## UX & Interaction Patterns

- Login screen carries the app's one deliberate dark/photo treatment (every other screen is light/flat): full-bleed dark background, top photo with a gradient fade to solid, inverted typography, light/unstyled-per-Login input fields, `StatusBar` overridden to dark styling, error state uses the dark error color tokens.
- The `AppIcon` glyph (pulse/heartbeat, 40×40px, 12px gap above the "TeamPulse" title) appears only on the Login screen (default and error states) — not on any other screen. It also generates the favicon/PWA icon set at build time, replacing the default Next.js favicon.
- Login failure shows an inline error, "Incorrect username or password.", with the username field retaining its entered value; the error is linked to its field via `aria-describedby`.
- Loading screen: full-screen branded splash (`AppIcon` on an 80px chip with 2-3 concentric pulsing rings, ~2s cycle, `ease-out`), a caption label beneath, flat page background, no artificial min/max display time. Under `prefers-reduced-motion`, replace animated rings with a single static ring at ~40% opacity.
- Voice/tone: plain, literal microcopy throughout — no exclamation points, no gamified language.

## Cross-Story Dependencies

- Story 1.2 (auth) depends on Story 1.1's Drizzle/Postgres wiring and `user`/`role` schema being in place first.
- All of Epic 2's stories depend on this epic's DAL session/role guards, Server Action return-shape convention, and test tooling being established — nothing there should re-derive its own auth or testing pattern.
