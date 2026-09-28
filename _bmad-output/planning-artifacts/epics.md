---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-TeamPulse-2026-09-28/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-TeamPulse-2026-09-28/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-TeamPulse-2026-09-28/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-TeamPulse-2026-09-28/EXPERIENCE.md
---

# TeamPulse - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for TeamPulse, decomposing the requirements from the PRD, UX Design (DESIGN.md + EXPERIENCE.md), and Architecture (ARCHITECTURE-SPINE.md) into implementable stories.

**Resolved conflict:** `EXPERIENCE.md`'s Admin status control description ("forward-only stage picker") contradicts PRD FR-4 and Architecture AD-4, both of which explicitly allow an Admin to move an Idea's status in either direction. Confirmed with the user (2026-09-28): PRD/Architecture wins — the Admin status control must support moving to any of the four status values, in either direction. `EXPERIENCE.md` §Component Patterns (Admin status control row) is stale on this point and should be corrected in a future UX pass; stories below follow FR-4/AD-4, not the stale line.

## Requirements Inventory

### Functional Requirements

FR-1: An Employee can submit a new Idea consisting of a title and a description. A submitted Idea is created with Status = New, submitter = the authenticated Employee, upvote count = 0, and a creation timestamp. Title and description are both required and non-empty. The new Idea appears in the Idea list immediately after submission, with no moderation/approval gate. Out of scope: attachments/rich text, editing/withdrawing, categories/tags/duplicate detection.

FR-2: An Employee can view a list of all submitted Ideas, each showing its title, current Status, and upvote count. The list includes Ideas in every Status — nothing hidden by default. An Employee can open an Idea to see its full description. Default sort is newest-first; sort/filter is deferred. Out of scope: search, filtering, comments/discussion.

FR-3: An Employee can upvote any Idea, once per Idea. Upvoting increments the Idea's upvote count by 1, reflected in the Idea list without a page-reload delay beyond normal request latency. An Employee cannot upvote the same Idea a second time; the UI reflects that they've already upvoted it. Self-upvoting is allowed. Un-upvoting is out of scope for v1.

FR-4: An Admin can change any Idea's Status to any of the four defined values (New, Under Review, Planned, Done). Only users with the Admin role can change Status — a non-Admin Employee has no UI path or API access to do so. A Status change is reflected in the Idea list and detail view for all Employees on next view — no notification is sent. Status changes are not restricted to forward-only movement — an Admin can move an Idea backward (e.g., Planned back to Under Review). Only one role distinction exists in v1 (Employee vs. Admin) — no per-idea ownership or approval workflow.

FR-5: A person must authenticate with a username and password before accessing any TeamPulse feature. All routes and API endpoints (view, submit, upvote, admin status change) require an authenticated session. An unauthenticated request is redirected to login (web) or rejected (API). Accounts are Admin-provisioned, not self-registration. Out of scope: SSO/SAML/OAuth, MFA; password-reset-via-email is assumed necessary at minimum but full spec is left to implementation/addendum.

### NonFunctional Requirements

NFR-1: Mobile-first responsive web design — phone is the primary target; the same single-column layout renders at a constrained max width on tablet/desktop.

NFR-2: Upvote and status-change UI updates apply optimistically, with no perceptible delay beyond normal network request latency; reconciles with the server response.

NFR-3: Exactly two roles exist in v1 (Employee, Admin) — no per-idea ownership or approval workflow layered on top.

NFR-4: WCAG 2.2 AA is the accessibility floor: status badges distinguishable by text label (not color alone); upvote control exposes an accessible name reflecting state ("Upvote — 12, not yet upvoted" / "Upvoted — 12"); Add Idea overlay traps focus and returns focus to the trigger on close; Admin status control is a native/ARIA-compliant select or radio-group, never a div-based custom widget; form errors are associated with their field via `aria-describedby`.

NFR-5: Every Server Action returns a discriminated union (`{ ok: true; data: T } | { ok: false; error: string }`); `error` is always short, display-ready copy from a small fixed set of cases (not-found, forbidden, validation, unexpected) — never a raw exception message or stack; the underlying cause is server-logged only, keyed by a request id.

### Additional Requirements

- Greenfield project: `create-next-app` scaffold already exists (App Router, Tailwind, TypeScript, `src/app/layout.tsx` + `page.tsx`). No starter template to apply — Drizzle ORM, Better Auth, Vitest, and Playwright are decided but **not yet installed**; installing/wiring each is implementation work.
- Layered architecture, enforced by convention, not just documented: `Presentation (Server/Client Components)` → `Server Actions (mutation boundary)` → `DAL (auth-checked reads/writes)` → `Persistence (Postgres)`.
- AD-1: Mutations go through Server Actions only — no Route Handlers (`app/api/**`) for mutations in v1.
- AD-2: Authorization lives only in the DAL. Every Server Action and every Server Component reading protected data calls a DAL function performing both the authorization guard and the read/write. `lib/db` is imported only from `lib/dal/**`.
- AD-3: Upvote uniqueness is a DB constraint — `upvotes` join table with a unique constraint on `(idea_id, user_id)`. Upvote count is derived via `COUNT`, never a directly-incremented column. A duplicate-upvote unique-constraint violation is caught in the DAL and treated as an idempotent success, never surfaced as an error.
- AD-4: Status validation checks value + Admin role only, never direction — no adjacency/direction check exists anywhere in the write path (confirms the resolved conflict above).
- AD-5: Optimistic UI uses React's `useOptimistic`, colocated with the Server Action call in the owning Client Component. No global client-side store/cache.
- AD-6: `cacheComponents` stays off (default `false`); no cache directives anywhere. Freshness comes from `revalidatePath` in the Server Action — every mutating action revalidates every path displaying the affected idea (`/ideas` and `/ideas/[id]`).
- AD-7: `proxy.ts` (renamed `middleware.ts`) only reads the session cookie and redirects unauthenticated requests to `/login`; it never queries the database or makes a role decision. Every protected Server Action/Server Component still calls the DAL.
- AD-8: `role` (`employee` | `admin`) is a field on the auth library's own user record (schema-extended), set only via direct admin provisioning (seed/DB action). No parallel allowlist.
- AD-9: Every integration test that touches the DAL runs against a real, disposable Postgres instance (Docker locally, GitHub Actions `services:` container in CI, both pinned to `postgres:18`) — never a mock or in-memory emulator.
- Naming/data conventions: DB tables `snake_case` plural (`ideas`, `upvotes`, `user`); TS types `PascalCase` singular; Server Actions colocated as `actions.ts`; DAL guards named `requireX()`. Primary keys are UUID v4. Timestamps `timestamptz`, ISO 8601 UTC at the API boundary.
- Migrations: `drizzle-kit generate` commits SQL migration files to the repo; `drizzle-kit migrate` runs as a required deploy-pipeline step, never by hand against production.
- Env vars validated at startup via a schema (e.g. Zod) so a missing `DATABASE_URL`/auth secret fails fast in dev, not mid-request in prod.
- Testing convention: DAL functions and Server Actions are the unit under test via integration tests against disposable test Postgres; migrations run once per container/job start, then each test file truncates the tables it touches; Playwright covers the five FR journeys end-to-end before each release.
- Infra already scaffolded and should be reused, not recreated: `docker-compose.yml` (Postgres 18, host port 1999, named volume at PG18's versioned `PGDATA` path, `pg_isready` healthcheck), `.github/workflows/ci.yml` (install → lint → typecheck stages live; DB/integration/e2e stages stubbed/commented pending Drizzle/Vitest/Playwright), `SETUP.md`, `.env.example`.
- Source tree convention to follow: `src/app/(auth)/login`, `src/app/(app)/layout.tsx`, `src/app/(app)/ideas/{page.tsx,actions.ts,[id]/{page.tsx,status-actions.ts}}`, `src/lib/db/{schema.ts,index.ts}`, `src/lib/dal/{session.ts,ideas.ts}`, `src/lib/auth/index.ts`, `src/proxy.ts`.
- Core entities: `user` (id, username, role), `ideas` (id, title, description, status, submitter_id, created_at), `upvotes` (idea_id, user_id, created_at; unique on idea_id+user_id).
- Per AGENTS.md Definition of Done: every story's implementation must pass lint (`npm run lint`), build/typecheck (`npm run build`), and — once scaffolded during this epic set — unit tests (Vitest), functional/e2e tests (Playwright, covering the five FR journeys), and UI verification (Percy, once installed). Tooling installation is in-scope implementation work, not a precondition assumed to already exist.

### UX Design Requirements

UX-DR1: Implement the 5 IA surfaces exactly as scoped in `EXPERIENCE.md`: Loading, Login, Idea list, Idea detail, Add Idea overlay. No settings, search/filter, or notifications surface exists.

UX-DR2: Build the reusable component set referenced by `design/ux-design.pen` (the live composition reference — not the frozen `mockups/*.html` snapshots): `StatusBar`, `StatusBadge` (4 variants: New/Under Review/Planned/Done), `UpvoteControl` (inactive/active), `IdeaCard`, `PrimaryButton`, `InputField`, `AddIdeaFab`, `AppIcon`, `AdminStatusControl`, the Loading screen's pulsing-ring treatment, `ErrorNote`.

UX-DR3: Login screen carries the one deliberate dark/photo treatment in the app (scoped exception, all other screens stay light/flat): full-bleed `brand-dark` background, top-380px photo at 0.65 opacity with a top-to-50% gradient fade to solid, inverted typography (`text-inverse` title, `text-dark-secondary` subtitle/labels), `StatusBar` overridden to dark styling, inputs stay light/unstyled-per-Login, error state uses `error-bg-dark`/`error-dark`.

UX-DR4: Loading screen: full-screen branded splash — `AppIcon` on an 80px `brand-primary-light` chip with 2–3 concentric `brand-primary` pulse rings expanding/fading (CSS `@keyframes`, ~2s cycle, ~0.7s stagger, `ease-out`), `LoadingLabel` beneath in `text-secondary`, flat `bg-page` background. No artificial min/max display time. `prefers-reduced-motion`: replace animated rings with a single static ring at ~40% opacity.

UX-DR5: Idea card interaction: tapping anywhere on the card except the upvote control opens Idea detail; the upvote control is its own independent tap target so a scanning user can upvote without opening detail.

UX-DR6: Add Idea overlay: sheet on mobile / centered dialog on desktop, opens from list or detail without navigating away. Two required fields (title, description); Submit stays disabled until both are non-empty. On success: overlay closes, new idea appears at top of list (no confirmation toast — the card appearing is the confirmation). Dismiss (tap outside / swipe down / `Esc`) with empty fields closes silently; with content, discards silently (no confirm dialog). Traps focus while open; close returns focus to the triggering element.

UX-DR7: Admin status control (Idea detail only, Admin role only): renders only for Admins — absent, not disabled, for Employees. Native/ARIA-compliant select or radio-group. Per the resolved conflict, supports moving to any of the four status values in either direction (not forward-only); selecting a value applies immediately, no confirm dialog; badge updates in place (optimistic), no toast.

UX-DR8: State patterns to implement: cold-load skeleton on the Idea list (title bar + badge + count placeholders); empty-list state ("No ideas yet. Be the first to add one." + primary Add Idea action); already-upvoted control renders permanently active, re-tap is a no-op (no error, no toast); inline, field-content-preserving error states on login failure ("Incorrect username or password.", username retained) and on submit/status-change failure (retains form/state so the user can retry without re-entering data).

UX-DR9: Voice and tone: plain, literal microcopy throughout — no exclamation points, no gamified language ("12 upvotes" not "12 people love this! 🎉"; "Under Review" not "We're on it!"; status-change confirmation is the badge itself, e.g. reads as "Marked as Planned" in intent, not "Woohoo, planned!").

UX-DR10: Accessibility floor (WCAG 2.2 AA): status badges distinguishable by text label not color alone; upvote control has an accessible name reflecting state; Add Idea overlay focus-traps and restores focus on close; Admin status control is native/ARIA-compliant; form errors linked via `aria-describedby`.

UX-DR11: App icon (pulse/heartbeat glyph, `assets/app-icon.svg`, rendered in `brand-primary`): shown only on the Login screen (both default and error states), 40×40px, 12px gap above the "TeamPulse" title; not shown on Idea list/detail (wordmark/page title is sufficient there). Also generates the favicon and PWA/home-screen icon set at build time, replacing the default Next.js favicon.

UX-DR12: Design-token discipline: `brand-primary` purple used only for the Add Idea action, form focus states/focus ring, and active-selection color (upvote control uses the lighter `brand-primary-light`/`brand-primary-subtle` pairing for its active state) — never decoratively. Status-badge colors are tinted background + colored text (never solid fills): New→neutral (`bg-muted`/`text-secondary`), Under Review→`warning`/`warning-bg`, Planned→`info`/`info-bg`, Done→`success`/`success-bg`. Typeface is Inter at the app-appropriate sizes (`display` 32px/600, `heading` 20px/600, `body` 16px/400, `label` 14px/500, `caption` 12px/400) — never the org's marketing hero sizes. 4px spacing scale; `content-max-width` 768px; single-column layout at every width. Corner radii: `rounded.md` (buttons/inputs/overlay), `rounded.lg` (idea cards), `rounded.full` (badges/upvote control). Idea cards are flat (hairline border, no shadow); shadows reserved for the Add Idea FAB and overlay only.

### FR Coverage Map

FR1: Epic 2 - Submit an Idea
FR2: Epic 2 - View all Ideas (list + detail)
FR3: Epic 2 - Upvote an Idea
FR4: Epic 2 - Admin changes Status
FR5: Epic 1 - Authenticate

## Epic List

### Epic 1: Authentication & Foundation
An Employee can log in with a username and password and land on a protected, authenticated app shell; anyone unauthenticated is blocked from every route and API. Also covers the project foundation everything else builds on: Drizzle + Postgres wiring, Better Auth setup, the `user` table with `role`, the DAL's session guards, `proxy.ts`, the Server Action return-shape convention, and installing/wiring the test tooling (Vitest, Playwright) called out as TODO in `AGENTS.md`.

**FRs covered:** FR-5

### Story 1.1: Project Data & Test Foundation

As a developer,
I want Postgres wired up via Drizzle with migrations tooling, and Vitest + Playwright installed and wired into npm scripts and CI,
So that every subsequent story can persist data and be verified against the project's Definition of Done.

**Acceptance Criteria:**

**Given** the repo's existing `docker-compose.yml` Postgres service (port 1999)
**When** `npm run db:migrate` is run locally against `DATABASE_URL` from `.env.local`
**Then** Drizzle applies migrations generated via `drizzle-kit generate`
**And** the SQL migration files are committed to the repo (not applied ad hoc)

**Given** Drizzle is installed
**When** `src/lib/db/index.ts` and `src/lib/db/schema.ts` are created
**Then** `index.ts` exports a typed Drizzle client, and `schema.ts` declares the `user` table (`id` uuid, `username`, `role` enum `employee`|`admin`) ready for Better Auth's schema extension (AD-8)
**And** the Drizzle client is structured so it is importable only from `lib/dal/**` (AD-2) — no import of it exists outside that directory

**Given** Vitest is installed
**When** `npm run test` (or an equivalent `test:integration` script) is run
**Then** it executes against a real Postgres instance — a Docker container locally, matching `postgres:18` — never a mock or in-memory substitute (AD-9)

**Given** Playwright is installed
**When** `npm run test:e2e` is run
**Then** a minimal placeholder spec executes successfully end-to-end, confirming the harness is wired correctly for later FR-journey coverage

**Given** `.github/workflows/ci.yml`'s currently-stubbed/commented DB, integration-test, and e2e stages
**When** this story is complete
**Then** those stages are uncommented and wired to the new npm scripts, running in order (install → lint → typecheck → migrate against a `services:` Postgres container pinned to `postgres:18` → integration tests → e2e) and failing fast at the first red stage

**Given** the app requires `DATABASE_URL` and a Better Auth secret to run
**When** the app boots without one of them set
**Then** it fails fast at startup with a clear validation error (a small schema, e.g. Zod) — not a runtime error mid-request

### Story 1.2: Employee Authenticates and Reaches the App

As an Employee,
I want to log in with my username and password,
So that I can access TeamPulse and my session persists across requests.

**Acceptance Criteria:**

**Given** Better Auth is configured with a credentials provider and the `user.role` field from Story 1.1
**When** a provisioned Employee submits their correct username and password on the Login screen
**Then** they are authenticated and redirected into the protected, authenticated app shell
**And** their session persists across subsequent requests without re-authenticating

**Given** incorrect credentials are submitted on the Login screen
**When** the login attempt fails
**Then** an inline error reads "Incorrect username or password." per `EXPERIENCE.md`
**And** the username field retains its entered value

**Given** an unauthenticated request to any protected page
**When** it is made
**Then** `proxy.ts` redirects it to `/login` based only on the session cookie, without querying the database (AD-7)

**Given** an unauthenticated request to any protected Server Action or Server Component data read
**When** it is made
**Then** the DAL's `requireSession()` is the authoritative rejection — a request that somehow bypassed `proxy.ts` is still blocked at the DAL (AD-2)

**Given** the Login screen is rendered (default or error state)
**When** a user views it
**Then** it matches `DESIGN.md`'s scoped dark/photo treatment — full-bleed dark background, top photo with gradient fade, inverted typography, light input fields — visually distinct from every other (light) screen in the app
**And** the `AppIcon` glyph appears above the "TeamPulse" title at 40×40px (UX-DR11), not shown on any other screen

**Given** the app is opening and session state has not yet resolved
**When** the Loading screen renders
**Then** it shows the branded pulsing-ring splash (UX-DR4) before resolving to either Login (unauthenticated) or the authenticated shell (authenticated)
**And** a user with `prefers-reduced-motion` set sees a single static ring at ~40% opacity instead of the animated version

**Given** accounts are Admin-provisioned only (no self-registration UI exists)
**When** this story is complete
**Then** a seed or DB-action mechanism exists to create a user with a given `role` (`employee` or `admin`) for local/dev and future production provisioning

**Given** NFR-5's Server Action return-shape convention
**When** the login action succeeds or fails
**Then** it returns the discriminated union `{ ok: true; data: T } | { ok: false; error: string }`, with `error` limited to short, display-ready copy — never a raw exception message

### Epic 2: Idea Board
Employees can submit an idea, browse the full board (all ideas, all statuses, newest-first), open an idea's detail, and upvote ideas they support — while Admins can additionally triage any idea through the four-stage status pipeline, in either direction. This is the product's entire value proposition once auth exists.

**FRs covered:** FR-1, FR-2, FR-3, FR-4

### Story 2.1: Submit an Idea

As an Employee,
I want to submit a new idea with a title and description,
So that it has a chance of being seen and acted on instead of getting lost.

**Acceptance Criteria:**

**Given** I am authenticated and viewing any screen in the app
**When** I tap the persistent Add Idea action
**Then** the Add Idea overlay opens (sheet on mobile, centered dialog on desktop) without navigating away from my current screen

**Given** the Add Idea overlay is open
**When** either the title or description field is empty
**Then** the Submit button stays disabled

**Given** both title and description are non-empty
**When** I tap Submit
**Then** a new Idea is created with `status = New`, `submitter = me`, `upvote_count = 0` (derived), and a creation timestamp
**And** the overlay closes with no confirmation toast — the created record is queryable via the DAL immediately after

**Given** the submit Server Action fails (e.g. network error)
**When** the failure occurs
**Then** an inline error is shown on the overlay and my typed title/description are retained so I can retry without re-entering data

**Given** I tap outside the overlay, swipe down, or press `Esc`
**When** both fields are empty
**Then** the overlay dismisses with nothing submitted
**And** when either field has content, it discards silently without a confirm dialog

**Given** the overlay is open
**When** it renders
**Then** it traps focus while open, and closing it (via submit, dismiss, or Esc) returns focus to the triggering element
**And** the title/description inputs use the `input` design token (48px height, `border-default`, `brand-primary` focus border + focus ring)

**Given** the mutation path
**When** the submit action executes
**Then** it goes through a Server Action only (AD-1), and the Server Action calls a DAL function that performs the write — it never imports the Drizzle client directly (AD-2)
**And** it returns the `{ ok: true; data } | { ok: false; error }` discriminated union (NFR-5)

### Story 2.2: Browse the Idea Board

As an Employee,
I want to view all submitted ideas and open one to read its full description,
So that I can see what others have proposed and track what's happening.

**Acceptance Criteria:**

**Given** ideas exist in every status (New, Under Review, Planned, Done)
**When** I open the Idea list
**Then** all of them are visible by default — nothing is hidden or filtered
**And** each idea card shows its title, current status badge, and upvote count
**And** the list is sorted newest-first

**Given** the Idea list is loading
**When** data has not yet arrived
**Then** skeleton rows matching the card layout (title bar + badge + count placeholders) render, per `EXPERIENCE.md`'s cold-load state

**Given** no ideas have been submitted yet
**When** I open the Idea list
**Then** it shows "No ideas yet. Be the first to add one." with the primary Add Idea action, not a blank screen

**Given** an idea card in the list
**When** I tap anywhere on it except the upvote control
**Then** I am taken to that idea's detail view, showing its full title, description, status badge, and upvote count
**And** tapping the upvote control instead does not open the detail view (it is its own independent tap target — behavior verified structurally here; upvote logic itself is Story 2.3)

**Given** the status badge is rendered (list or detail)
**When** it displays any of the four statuses
**Then** it uses the tinted background + colored text pairing from `DESIGN.md` (never a solid fill), is identical in both places, and is distinguishable by its text label alone, not color (NFR-4)

**Given** the read path
**When** the list or detail page renders
**Then** it reads through a Server Component calling the DAL (AD-2), with `cacheComponents` off and no cache directive on the route (AD-6)

**Given** the viewport
**When** the list or detail renders on phone, tablet, or desktop
**Then** it stays a single-column layout at every width, within `content-max-width` (768px) on larger screens (NFR-1)

### Story 2.3: Upvote an Idea

As an Employee,
I want to upvote an idea I support, once per idea,
So that collective demand for it becomes visible instead of staying scattered across private conversations.

**Acceptance Criteria:**

**Given** an idea I have not yet upvoted
**When** I tap its upvote control (from the list card or the detail view)
**Then** the count increments immediately in the UI (optimistic, via `useOptimistic` colocated in the owning Client Component — AD-5) and reconciles with the server response
**And** the control switches to its active visual state (`brand-primary-light` / `brand-primary`) and stays that way permanently

**Given** I have already upvoted an idea
**When** I tap its upvote control again
**Then** nothing happens — no error, no toast, no second increment (idempotent no-op)
**And** the underlying duplicate-upvote attempt is caught at the database's unique constraint on `(idea_id, user_id)` and treated as success inside the DAL, never surfaced as an `{ ok: false }` error (AD-3)

**Given** the upvote count
**When** it is displayed anywhere
**Then** it is always derived via `COUNT` over the `upvotes` table — never a directly-incremented or client-supplied column (AD-3)

**Given** I upvote my own submitted idea
**When** I tap its upvote control
**Then** it succeeds — self-upvoting is allowed

**Given** an upvote is cast from the detail view
**When** the mutation completes
**Then** every path displaying that idea is revalidated (`/ideas` and `/ideas/[id]`) — an upvote from detail must not leave the list stale (AD-6)

**Given** the upvote control
**When** rendered
**Then** it exposes an accessible name reflecting its state — "Upvote — 12, not yet upvoted" / "Upvoted — 12" (NFR-4)

### Story 2.4: Admin Triages Status

As an Admin,
I want to move any idea to any status in the four-stage pipeline, in either direction,
So that I can keep the pipeline reflecting real decisions without a heavyweight process.

**Acceptance Criteria:**

**Given** I am signed in as Admin and viewing an idea's detail view
**When** the page renders
**Then** the Admin status control is visible, rendered as a native/ARIA-compliant select or radio-group (never a div-based custom widget) (NFR-4, UX-DR7)

**Given** I am signed in as an Employee (not Admin)
**When** I view any idea's detail view
**Then** the Admin status control is entirely absent from the DOM — not disabled, not hidden via CSS — and there is no API path available to change status either

**Given** I am Admin and select any of the four status values
**When** the value differs from the idea's current status, regardless of pipeline direction (including moving backward, e.g. Planned → Under Review)
**Then** the change applies immediately with no confirm dialog, and the DAL guard accepts it — the guard checks only that the value is one of the four valid statuses and that the caller is Admin, with no adjacency/direction check anywhere in the write path (AD-4, resolving the `EXPERIENCE.md` "forward-only" line as stale)

**Given** a status change is applied
**When** it completes
**Then** the badge updates in place optimistically in the detail view, with no toast — the badge change is the confirmation
**And** the change is reflected in both the Idea list and detail view for all Employees on their next view (no notification is sent)

**Given** a non-Admin attempts to invoke the status-change Server Action directly (bypassing the UI)
**When** the DAL processes the request
**Then** it is rejected — authorization is enforced in the DAL, not just by the control's absence in the UI (AD-2)

**Given** the status-change mutation path
**When** it executes
**Then** it goes through a Server Action only (AD-1) and returns the `{ ok: true; data } | { ok: false; error }` discriminated union (NFR-5)
