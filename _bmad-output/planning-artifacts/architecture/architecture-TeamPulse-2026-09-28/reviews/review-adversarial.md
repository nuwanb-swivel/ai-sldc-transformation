---
title: Adversarial Review — TeamPulse Architecture Spine
target: _bmad-output/planning-artifacts/architecture/architecture-TeamPulse-2026-09-28/ARCHITECTURE-SPINE.md
method: construct pairs of spine-compliant units that would still be incompatible with each other; check spine coverage against a good-spine checklist
created: 2026-09-28
---

# Adversarial Review — TeamPulse Architecture Spine

## Verdict

The spine is well-constructed for the paradigm-and-mutation-path level (AD-1 through AD-8 close the "obvious" clashes: mutation transport, auth location, upvote race, status direction, optimistic mechanism, caching, proxy authority, identity source) but it leaves the **write side of the DAL, the error-envelope's content contract, the per-action cache-invalidation scope, and the client-side auth-bootstrap sequencing** underspecified — each of these is a place where two engineers, each following every AD to the letter, would ship incompatible code. The Deployment & Environments subsection is also too thin for an initiative-altitude document: it names a platform assumption but says nothing about migration execution, secrets handling, or CI/CD, which is exactly the kind of thing that causes environment drift between two features built by two people.

## Adversarial Findings (spine-compliant pairs that still clash)

### F1 — DAL write-function ownership is unstated (critical)

AD-1's diagram shows `SA --> DAL --> DB` for every mutation, and AD-2 calls the DAL "the sole place authorization and session checks happen." But the **Source Tree** only names read exports off `lib/dal/ideas.ts` (`getIdeas, getIdea` — "authorized reads"); it never says where `createIdea`, `addUpvote`, or `updateStatus` live.

- **Engineer A** (submit-idea story): reads the Source Tree literally — DAL is for reads — and writes `db.insert(ideas)...` directly inside `app/(app)/ideas/actions.ts` after calling `requireSession()`.
- **Engineer B** (status-change story): reads AD-1's diagram and AD-2's "DAL is the sole place ... checks happen" literally, and adds `updateStatus()` as an exported DAL function in `lib/dal/ideas.ts`, calling it from `status-actions.ts`.

Both obey every AD. The result: two different mutation shapes in the same codebase — one where business/validation logic sits in the Action, one where it sits in the DAL — which is precisely the inconsistency the layered paradigm exists to prevent ("keep the mutation path ... in one predictable place," spine line 33). A third engineer building upvote has no rule to resolve which pattern to copy.

**Fix:** Add an AD (or extend AD-1/AD-2) stating explicitly that the DAL exposes both authorized reads *and* authorized writes (`createIdea`, `addUpvote`, `updateStatus`), and that Server Actions never call `db`/Drizzle directly — only DAL functions. Update the Source Tree comment accordingly.

### F2 — Duplicate-upvote handling: DB-constraint violation vs. the UX's "silent no-op" contract (high)

AD-3 mandates a DB-level unique constraint on `(idea_id, user_id)`, checked with no app-level pre-check ("Upvote count is derived... never a client-supplied or directly-incremented column," and explicitly *not* an app-level check). The Consistency Conventions table mandates every Server Action return `{ ok: true; data: T } | { ok: false; error: string }`. `EXPERIENCE.md`'s Component Patterns table requires: "a second tap on an already-active control does nothing (no error, no toast)."

- **Engineer A** treats the unique-violation from Postgres as an expected, idempotent outcome and catches it inside `upvoteIdea`, returning `{ ok: true, data: <unchanged idea> }` — matching the UX's "no error" requirement.
- **Engineer B** follows the error-envelope convention literally: any DB error becomes `{ ok: false, error: "..." }`. On a duplicate upvote (e.g., a stale optimistic client re-firing, or two tabs), the action returns `ok: false`, and the calling Client Component — per AD-5, whose only contract is "use `useOptimistic`, reconcile on the server round-trip" — rolls back the optimistic increment and/or surfaces the error string, contradicting the UX's explicit "no error, no toast" rule.

Both engineers followed AD-3 (constraint-based, no app check) and the error-envelope convention to the letter; they diverge only because nothing states how a *unique-constraint violation specifically* maps onto the envelope.

**Fix:** Add a Consistency Convention row (or AD-3 addendum): "A duplicate-upvote constraint violation is caught in the DAL/Action and normalized to `{ ok: true, data }` (idempotent success), never `{ ok: false }`." This also needs to interact with F3 below.

### F3 — Error envelope has no content contract: display text vs. error code (high)

The `error: string` field's content is unspecified — is it end-user-ready copy, or a machine-readable code the Client Component maps to copy? `EXPERIENCE.md`'s Voice and Tone table is explicit and strict ("no exclamation points, no gamified language") and State Patterns requires specific inline copy ("Incorrect username or password.", "Marked as Planned.").

- **Engineer A** (login/add-idea forms) returns `error: "Title is required"` — display-ready prose, rendered directly via `aria-describedby`.
- **Engineer B** (status-change action) returns `error: "FORBIDDEN"` or `"VALIDATION_ERROR"` — a code, expecting the caller to map it to voice-compliant copy — because nothing in the spine says otherwise and codes are the more defensible engineering default for a discriminated union consumed by multiple call sites.

Both comply with the Consistency Convention's literal type (`error: string`). One surface renders internal-grade text to users (breaking the Voice and Tone table and the accessibility floor's "form errors ... associated via `aria-describedby`" — an un-mapped code fails this in spirit); the other requires a copy-mapping layer that doesn't exist anywhere in the source tree.

**Fix:** Add a Data & Formats convention row: whether `error` is display-ready copy (then Voice and Tone constraints bind it explicitly) or a fixed enum of codes with a single client-side copy map (and where that map lives).

### F4 — Missing per-action `revalidatePath` scope lets one surface go stale while another obeys AD-6 (high)

AD-6 says freshness after mutation "comes from `revalidatePath` in the Server Action," but never states *which paths* each action must revalidate. The idea list and idea detail both render `status` and upvote count independently (per `getIdeas`/`getIdea` reads), and FR-3 requires the list to reflect an upvote "without a page reload delay beyond normal request latency."

- **Engineer A** (upvote, invoked from idea detail) calls `revalidatePath('/ideas/[id]')` only — correct for the surface they're testing on.
- **Engineer B** (status change) calls `revalidatePath('/ideas')` and `revalidatePath('/ideas/[id]')` — because FR-4 explicitly names both list and detail as needing to reflect the change.

Both are individually AD-6-compliant ("revalidatePath, not opting out of cache"), but Engineer A's narrower scope means an upvote cast from the detail page leaves the list page's cached router entry stale until an unrelated navigation forces a refetch — silently violating FR-3's "no page reload delay" consequence for that path, with nothing in the spine to catch the omission.

**Fix:** Add a small table (Capability → Architecture Map extension, or a new Consistency Convention row) listing the exact `revalidatePath` targets per Server Action: submitIdea → `/ideas`; upvoteIdea → `/ideas` and `/ideas/[id]`; changeStatus → `/ideas` and `/ideas/[id]`.

### F5 — Client-side "Loading" bootstrap surface is not reconciled with AD-7's server-side proxy redirect (medium)

`EXPERIENCE.md`'s Information Architecture names **Loading** as a real surface: "App open, before auth/session state is known ... Branded splash while the app determines whether to show Login or the Idea list," resolved client-side. AD-7 says `proxy.ts` reads the session cookie and redirects unauthenticated requests to `/login` *before* any component renders — i.e., the server already knows the auth outcome on the very first response for a protected route.

- **Engineer A** builds the root layout to always render the branded splash and resolve auth via a client-side session check (literal reading of the UX IA table), duplicating work `proxy.ts` already did.
- **Engineer B** relies purely on AD-7's server redirect and never renders the Loading surface for protected routes at all (it only theoretically fires on the unauthenticated → `/login` hop, which per AD-7 is itself a redirect, not a rendered client state) — treating the UX's Loading spec as effectively dead code, contradicting `EXPERIENCE.md`'s explicit inclusion of it as a designed, motion-specced surface (`Motion & Loading` section).

Neither reading is wrong under the spine as written — AD-7 constrains only where *authorization* decisions happen, not where the bootstrap *UI* comes from, and the UX doc doesn't reference AD-7 at all. This is a real behavioral gap between two "each side wins on its own document" readings.

**Fix:** Add a line to AD-7 or a new AD stating explicitly when/whether the Loading surface renders (e.g., "Loading renders only on the unauthenticated→authenticated transition on the client after a session-check call; `proxy.ts`'s redirect handles the already-known-unauthenticated case server-side before any paint").

### F6 — Admin role check: session-claim trust vs. per-request DB read (medium)

AD-8 fixes the *source* of role (`role` field on the auth user record, no parallel allowlist) but not how `requireAdmin()` *reads* it at request time — from a session/JWT claim already resolved at login, or a fresh DB lookup every call. AD-6 mandates per-request freshness for `ideas` data reads but is scoped to "reads" generally and doesn't explicitly name the session/auth subsystem.

- **Engineer A** implements `requireAdmin()` to trust the role embedded in Better Auth's session object (cheap, avoids an extra query per Server Action).
- **Engineer B** implements it to re-query the `user` table by id on every call, reasoning that AD-6's "no cached reads" spirit should extend to authorization state too, and that FR-4's role check must reflect the *current* role.

If Admin status is ever revoked from a still-logged-in user (a plausible operational action, though not named as a requirement), Engineer A's surface keeps admitting the demoted user until their session expires/refreshes; Engineer B's does not. Both are AD-8-compliant; the spine is silent on which is required, and the two behave differently under a realistic operational scenario the PRD doesn't rule out.

**Fix:** Extend AD-8 (or AD-2) with an explicit rule: role is read fresh from the DB in `requireAdmin()` on every call (matching AD-6's per-request-freshness spirit), not cached in the session token/claim.

## Good-Spine Checklist — Coverage Audit

| Dimension | Covered? | Note |
| --- | --- | --- |
| Mutation path / transport | Yes | AD-1 |
| Authorization boundary | Yes | AD-2, but see F1/F6 for read/write-DAL and freshness gaps |
| Concurrency-sensitive invariant (upvote) | Yes | AD-3, but see F2 for the error-envelope interaction |
| Business-rule direction (status) | Yes | AD-4 |
| Client state/optimistic UI | Yes | AD-5, but doesn't state rollback behavior on `ok:false` |
| Caching/freshness | Partial | AD-6 states the policy but not the per-action scope (F4) |
| Edge/middleware authority | Yes | AD-7, but doesn't reconcile with the UX's Loading surface (F5) |
| Identity/role source | Yes | AD-8, but not its read-time caching behavior (F6) |
| Naming conventions | Yes | table present |
| ID/date/error-shape conventions | Partial | IDs and dates are concrete; error shape's *content contract* is not (F3) |
| **Deployment & Environments** | **Thin** | See below |
| **Operations/observability** | Deferred with reason | Acceptable for this altitude/MVP size, but see compounding note below |
| **Testing strategy** | **Missing entirely** | No unit/integration/e2e approach, no test directory convention, no DB-test strategy (e.g., testcontainers vs. mocked DAL) named anywhere. At initiative altitude this is a structural dimension left completely silent — two engineers could each adopt an incompatible test approach (e.g., one mocks the DAL in unit tests, another spins up a real Postgres per AD-3's constraint semantics, which can't be verified without one) with zero guidance to reconcile them. |
| Secrets/env-var management | Partial | Convention table says env vars are Zod-validated at startup, but says nothing about *how* secrets differ/rotate across the three named environments, or how they're provisioned (Vercel env UI vs. `.env` vs. a secrets manager) |
| Migration execution strategy | **Missing** | Drizzle schema + drizzle-kit are named in Stack, but nothing states *when/how* migrations run against staging/production (build step, deploy hook, manual `drizzle-kit push`/`migrate`). Two engineers each shipping a schema change (e.g., adding `role`, then later adding `upvotes`) could each assume a different migration-execution path, causing environment schema drift — especially risky given AD-3's constraint and AD-8's schema-extension both require a migration to exist before their invariant is enforceable. |
| CI/CD pipeline | **Missing** | No mention of build/test/deploy pipeline, preview-environment behavior for PRs, or rollback strategy. |
| Backup/DR | **Missing** | Not mentioned; likely fine to defer explicitly, but currently just absent rather than deferred-with-reason. |

**Deployment & Environments verdict:** too thin for this altitude. It correctly flags the platform choice itself as an open `[ASSUMPTION]`/Deferred item, which is honest — but even conditional on Vercel + managed Postgres being confirmed, it says nothing about migration execution, secrets provisioning, or CI/CD, all of which are initiative-level decisions that individual story implementers cannot safely default on their own without risking exactly the kind of drift this document exists to prevent. Recommend promoting "migration execution strategy" and "secrets/env provisioning" to either a full AD or an explicit Deferred entry with reasoning (the current Deferred list has neither).

## Recommended Actions (priority order)

1. **F1** — Add an AD (or extend AD-2) fixing DAL as the sole write surface too, not just reads; update Source Tree.
2. **F4** — Add explicit `revalidatePath` scope per action.
3. **F2 + F3** — Resolve together: define the error-envelope's content contract, and state the duplicate-upvote-is-success rule as part of it.
4. **Migration execution strategy** — add to Deployment & Environments or Deferred-with-reason.
5. **F6** — Pin `requireAdmin()`'s role read to per-request DB freshness.
6. **F5** — Reconcile Loading surface with AD-7.
7. **Testing strategy** — at minimum, one sentence naming the approach (e.g., DAL unit-tested against a real/test Postgres instance; Server Actions integration-tested; no e2e in v1) so two stories don't invent incompatible harnesses.
