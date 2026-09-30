# Epic 2 Context: Idea Board

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver the product's core value proposition: Employees can submit an idea, browse the full board across every status, open an idea to read its full description, and upvote ideas they support — while Admins can additionally triage any idea through the four-stage status pipeline (New, Under Review, Planned, Done) in either direction. This epic assumes Epic 1's authenticated app shell, session guards, and Server Action conventions already exist; it builds the actual Idea Board experience on top of them.

## Stories

- Story 2.1: Submit an Idea
- Story 2.2: Browse the Idea Board
- Story 2.3: Upvote an Idea
- Story 2.4: Admin Triages Status

## Requirements & Constraints

- Submitting an idea requires non-empty title and description; the created idea gets `status = New`, submitter = the authenticated user, `upvote_count = 0`, and a creation timestamp, and appears immediately with no moderation gate.
- The idea list shows every idea in every status (nothing hidden by default), each with title, status badge, and upvote count, sorted newest-first. Opening an idea shows its full description. Search, filtering, and comments are out of scope.
- Any Employee can upvote any idea (including their own) exactly once; a second upvote attempt on the same idea is a silent no-op, never an error. Un-upvoting is out of scope.
- Only Admins can change an idea's status, to any of the four values in either direction (no forward-only or adjacency restriction). Non-Admins have no UI path or API access to this action. Status changes are visible to all Employees on next view; no notifications are sent.
- Mobile-first single-column layout at every viewport, constrained to a max content width on tablet/desktop.
- Upvote and status-change UI updates must be optimistic with no perceptible delay, reconciling with the server response.
- Accessibility floor (WCAG 2.2 AA): status badges distinguishable by text label alone (never color alone); upvote control exposes an accessible name reflecting state ("Upvote — 12, not yet upvoted" / "Upvoted — 12"); Add Idea overlay traps focus and restores it to the trigger on close; Admin status control must be a native/ARIA-compliant select or radio-group, never a custom div widget; form errors linked to fields via `aria-describedby`.
- Every mutating Server Action returns a discriminated union (`{ ok: true; data } | { ok: false; error }`) with short, display-ready error copy — never a raw exception; underlying causes are server-logged only.

## Technical Decisions

- Mutations flow through Server Actions only — no Route Handlers for writes. Server Actions never import the Drizzle client directly; they call DAL functions that perform both the authorization check and the read/write.
- Upvote uniqueness is enforced by a DB unique constraint on `(idea_id, user_id)` in an `upvotes` join table; upvote count is always derived via `COUNT`, never a directly-incremented column. A unique-constraint violation from a duplicate upvote is caught in the DAL and treated as idempotent success.
- Status validation checks only that the value is one of the four valid statuses and that the caller is Admin — no direction/adjacency check exists anywhere in the write path (this overrides a stale "forward-only" note in the UX experience doc; PRD/architecture win).
- Optimistic UI is implemented with React's `useOptimistic`, colocated with the Server Action call in the owning Client Component — no global client-side store/cache.
- `cacheComponents` stays off; no cache directives on routes. Freshness comes from `revalidatePath` in each mutating Server Action, which must revalidate every path displaying the affected idea (`/ideas` and `/ideas/[id]`) — an upvote or status change from the detail view must not leave the list stale.
- Source tree convention: `src/app/(app)/ideas/{page.tsx,actions.ts,[id]/{page.tsx,status-actions.ts}}`, DAL guards in `src/lib/dal/ideas.ts` named `requireX()`.
- Core entities: `ideas` (id uuid, title, description, status, submitter_id, created_at), `upvotes` (idea_id, user_id, created_at; unique on idea_id+user_id).
- Naming/data conventions: DB tables `snake_case` plural, TS types `PascalCase` singular, timestamps `timestamptz` / ISO 8601 UTC at the API boundary.
- Test convention: DAL functions and Server Actions are unit-tested via integration tests against a disposable Postgres instance (never a mock); Playwright covers this epic's FR journeys end-to-end.

## UX & Interaction Patterns

- Five IA surfaces total for the app; this epic covers three of them: Idea list, Idea detail, and the Add Idea overlay (Loading and Login belong to Epic 1).
- Idea card: tapping anywhere except the upvote control opens the idea's detail view; the upvote control is its own independent tap target so a scanning user can upvote without opening detail.
- Status badge rendering is identical between list and detail: tinted background + colored text (never a solid fill) — New→neutral, Under Review→warning, Planned→info, Done→success — always visible, never hidden or truncated.
- Add Idea overlay: sheet on mobile / centered dialog on desktop, opens from list or detail without navigating away. Two required fields (title, description); Submit stays disabled until both are non-empty. On success, overlay closes silently and the new idea appears at the top of the list (the card appearing is the confirmation — no toast). Dismiss (tap outside / swipe down / `Esc`) discards silently regardless of content, with no confirm dialog. Traps focus while open; closing returns focus to the triggering element. Title/description inputs use the shared `InputField` token (48px height, default border, brand-primary focus border + ring).
- Admin status control (idea detail only, Admin role only): renders only for Admins — entirely absent (not disabled) for Employees; native/ARIA-compliant select or radio-group; selecting any of the four values applies immediately with no confirm dialog; badge updates in place optimistically, no toast.
- State patterns: cold-load skeleton on the idea list (title bar + badge + count placeholders); empty-list state reads "No ideas yet. Be the first to add one." with the primary Add Idea action; an already-upvoted control renders permanently active and a re-tap is a no-op; submit/status-change failures show an inline error that preserves the user's typed content/state for retry.
- Voice and tone: plain, literal microcopy — no exclamation points or gamified language ("12 upvotes", not "12 people love this! 🎉"; a status change reads as "Marked as Planned," not "Woohoo, planned!").
- Design tokens: `brand-primary` is reserved for the Add Idea action, form focus states, and active-selection color (the upvote control's active state uses the lighter `brand-primary-light`/`brand-primary-subtle` pairing instead). Idea cards are flat (hairline border, no shadow); shadows are reserved for the Add Idea FAB and overlay only. Corner radii: `rounded.lg` for idea cards, `rounded.full` for badges/upvote control, `rounded.md` for buttons/inputs/overlay.
- The canonical visual reference for these screens is the live `design/ux-design.pen` file, organized by navigation flow (Idea List → Idea Detail → Add Idea); the static HTML mockups are a frozen, potentially stale snapshot.

## Cross-Story Dependencies

- All four stories depend on Epic 1's authenticated session/DAL guards (`requireSession()`, role field on the user record) and the Server Action return-shape convention already being in place.
- Story 2.2 (Browse the Idea Board) establishes the list/detail read paths and card/badge rendering that Stories 2.1, 2.3, and 2.4 all render into and mutate.
- Story 2.3 (Upvote) and Story 2.4 (Status change) both rely on the `revalidatePath` convention covering both `/ideas` and `/ideas/[id]`, since either mutation can originate from the detail view and must not leave the list stale.
- Story 2.4's Admin status control is additive to the detail view built in Story 2.2 and must not appear at all in the DOM for non-Admins.
