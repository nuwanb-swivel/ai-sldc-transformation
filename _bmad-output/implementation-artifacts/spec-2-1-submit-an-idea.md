---
title: 'Submit an Idea'
type: 'feature'
created: '2026-09-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '5d39807f97b65c80adeed4ba16c607264760bb56'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Employees have no way to capture an idea before it gets lost — Epic 1 delivered the authenticated shell, but the app's entire value proposition (an Idea Board) doesn't exist yet.

**Approach:** Add a persistent "Add Idea" trigger to the authenticated shell that opens a focus-trapped overlay (sheet on mobile / centered dialog on desktop) with title and description fields; submitting calls a new Server Action → DAL function that creates the idea (`status = new`, submitter = caller, `upvote_count` derived as 0) and returns the standard discriminated-union result, with an inline, content-preserving error on failure.

## Boundaries & Constraints

**Always:**
- Mutation flows through a Server Action that calls a DAL function (`src/lib/dal/ideas.ts`) — the Server Action never imports the Drizzle client directly.
- New `idea` table: `id` uuid, `title`, `description`, `status` (new enum, default `new`), `submitterId` FK → `user.id`, `createdAt` timestamptz — matching Epic 2 context's entity shape.
- Result shape is `{ ok: true; data } | { ok: false; error }`; `error` is fixed, display-ready copy — the real failure is `console.error`-logged server-side only, never surfaced to the client.
- Submit stays disabled until both fields are non-empty; the overlay traps focus while open and restores it to the trigger on close.
- Dismissing via `Esc`, outside-tap, or swipe-down discards silently with no confirm dialog, regardless of field content.
- The Add Idea trigger renders in `src/app/(app)/layout.tsx` so it is reachable from every authenticated screen, per the AC.
- Inputs reuse the existing 48px/`border-default`/`brand-primary`-focus token pattern already used in `login-form.tsx`.

**Never:**
- Do not build the idea list/board, upvote control, or Admin status control — those are Stories 2.2–2.4.
- Do not add a moderation/approval gate — the idea is live at `status = new` immediately.
- Do not install a dialog/overlay library (Radix, shadcn, etc.) — no such dependency exists today; use a native `<dialog>` element instead.
- Do not modify `src/lib/auth/*`, `src/lib/dal/session.ts`, or the existing `user`/`session`/`account`/`verification` tables or `role` enum.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | title + description non-empty, authenticated | Row created (`status=new`, submitter=me, timestamp set); overlay closes silently, no toast | N/A |
| Empty fields | either field empty | Submit button stays disabled; no request sent | N/A |
| DAL/network failure | valid input, write throws | Inline error shown; typed title/description retained for retry | `{ ok:false, error: <fixed copy> }`; real cause `console.error`-logged only |
| Unauthenticated caller | no valid session | `requireSession()` rejects before any DAL write runs | N/A |
| Dismiss with content | Esc / outside-tap / swipe-down, fields non-empty | Overlay closes, nothing submitted, focus returns to trigger, no confirm | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/dal/session.ts` -- `requireSession()` returns the Better Auth session; use `session.user.id` as submitter. Do not modify.
- `src/lib/db/schema.ts` -- add an `idea` status `pgEnum` and the `idea` table here, following the `user` table's inline `id`/timestamp pattern (no shared factory exists in this codebase); add `ideaRelations` and extend `userRelations` with `ideas: many(idea)`.
- `src/lib/db/index.ts` -- Drizzle client, import as `@/lib/db`; DAL-only import boundary (AD-2).
- `src/app/(app)/layout.tsx` -- currently bare (`requireSession()` + a `div`); add the persistent Add Idea trigger + overlay host here.
- `src/app/(app)/page.tsx` -- current placeholder home; no changes required by this story (Story 2.2 replaces it with the board).
- `src/app/(auth)/login/actions.ts`, `login-form.tsx` -- reference pattern for `"use server"` discriminated-union actions, `useActionState` wiring, and hand-rolled Tailwind input styling.
- `src/lib/dal/session.test.ts`, `src/app/(auth)/login/actions.test.ts` -- copy the integration-test pattern: `vi.mock("next/headers"/"next/navigation")`, real Postgres via `db`/`client` from `@/lib/db`, `afterEach` truncate-cascade, `afterAll` `client.end()`.
- `e2e/login.spec.ts` -- reference for Playwright auth setup to reuse in a new idea-submit e2e spec.
- `design/ux-design.pen` -- consult via the `pencil` MCP tool for exact overlay spacing/tokens/icon before implementing the trigger and overlay markup; `DESIGN.md`/`EXPERIENCE.md` win on any conflict with the mock.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/db/schema.ts` -- add `ideaStatus` pgEnum (`new`, `under_review`, `planned`, `done`) and the `idea` table (`id`, `title`, `description`, `status` default `new`, `submitterId` FK → `user.id` cascade, `createdAt`) + relations -- persists the new entity
- [x] `drizzle/migrations/*.sql` -- run `npm run db:generate` and commit the generated file -- applies the schema change
- [x] `src/lib/dal/ideas.ts` -- add `createIdea({ title, description }, session)`: validate non-empty fields with a small Zod schema, insert, return the row -- single authoritative write path
- [x] `src/app/(app)/ideas/actions.ts` -- `"use server"` `submitIdea(prevState, formData)` calling `requireSession()` then `createIdea`, returning `{ ok, error }` with fixed copy on failure -- Server Action boundary (AD-1/AD-2, NFR-5)
- [x] `src/app/(app)/add-idea-overlay.tsx` -- client component: native `<dialog>`, `useActionState(submitIdea, null)`, Submit disabled until both fields filled, focus trap/restore, Esc/outside/swipe dismiss -- fulfills overlay UX + accessibility floor
- [x] `src/app/(app)/layout.tsx` -- render the persistent Add Idea trigger + overlay -- reachable from every authenticated screen
- [x] `src/lib/dal/ideas.test.ts` -- integration test covering the I/O matrix's happy path and empty-field rejection against real Postgres -- DAL is the authoritative write path
- [x] `e2e/idea-submit.spec.ts` -- Playwright coverage: open overlay, disabled Submit until filled, successful submit, Esc-dismiss discards content -- FR-1 journey coverage
- [x] `src/app/(app)/ideas/actions.test.ts` -- unit test covering the I/O matrix's DAL/network-failure (fixed error, real cause `console.error`-logged) and unauthenticated-caller (guard rejects before any DAL write) rows -- Server Action's own error/guard behavior had no covering test

**Acceptance Criteria:**
- Given I am authenticated on any screen, when I trigger Add Idea, then the overlay opens without navigation and traps focus.
- Given both fields are filled, when I submit, then a row is created with `status=new`, submitter=me, derived `upvote_count=0`, and the overlay closes silently with no toast.
- Given the DAL write fails, when submit is attempted, then an inline error shows fixed display copy and my typed values remain.
- Given I dismiss via Esc/outside-tap/swipe with content present, when I do so, then nothing is submitted and focus returns to the trigger, with no confirm dialog.
- Given I am unauthenticated, when the Server Action runs, then `requireSession()` blocks it before any DAL write occurs.

## Implementation Notes

- Consulted `design/ux-design.pen` via the `pencil` MCP tool (frames `JDLCj`/`st60b`/`ONpcB` for the overlay states, `qvPCi` InputField, `d8YvJ` PrimaryButton, `sR4y4` AddIdeaFab) for exact spacing/tokens: sheet radius `radius-lg` (16px, top corners only on mobile, all corners on the `sm:` centered dialog), grabber 36×4 `border-strong` pill, description box 96px min-height, error note `error-bg`/`error` with the fixed copy "Couldn't submit. Check your connection and try again.", disabled submit `bg-muted`/`text-disabled`.
- Added the design's `bg-muted`, `border-strong`, `text-disabled`, `error`, `error-bg` tokens to `src/app/globals.css` (previously only the Login/Loading-scoped subset existed there).
- The overlay is one root-level `<dialog>` sized to the full viewport (`fixed inset-0`) with the sheet/dialog card as its only child, rather than relying on the browser's default centered-dialog box model -- this makes the "outside tap" dismiss a simple `event.target === dialog` check and keeps the scrim (`bg-black/40`) under our own control; the native `::backdrop` is suppressed (`backdrop:bg-transparent`).
- `showModal()`/`close()` are relied on for focus trapping, `Esc` handling, and focus-restoration-to-trigger per spec constraint (no dialog/overlay library installed); this was verified via the Esc-dismiss e2e test and by manual Playwright screenshots at mobile (390px, sheet) and desktop (1280px, centered dialog) widths.
- No icon library exists in the codebase; the overlay's close ("×") icon is a small inline SVG rather than pulling in `lucide-react` (the `.pen` file uses Lucide's `x` icon, reproduced by hand to avoid a new dependency not called for by the spec).

## Spec Change Log

- Added `src/app/(app)/ideas/actions.test.ts`: the Matrix Test Audit found the "DAL/network failure" and "Unauthenticated caller" rows had no covering test (`ideas.test.ts` only exercises the DAL directly; the e2e specs only cover the happy path and dismiss). Added unit tests mirroring `login/actions.test.ts`'s mocking pattern (mock `next/headers`/`next/navigation`, real Postgres via a real signed-in session) plus a `vi.spyOn` on `createIdea` to force the write-failure branch.

## Review Triage Log

- **low, patch — fixed** — `src/lib/dal/ideas.ts:9-12` (`createIdeaSchema`) — `z.string().min(1)` on `title`/`description` is not trimmed, so a whitespace-only string (e.g. `" "`) passes as "non-empty" and would be persisted — contradicts the spec's own "validate non-empty fields" claim. Unreachable through the normal UI (client `canSubmit` trims), but any direct/bypassing caller of the Server Action or DAL hits it; confirmed by reading the schema — no `.trim()` anywhere in the DAL or action's manual check. Fixed: both fields now use `z.string().trim().min(1)`.
- **medium, patch — fixed** — `src/app/(app)/add-idea-overlay.tsx` (`useEffect` on `state`, ~line 44) — the success effect calls `dialogRef.current?.close()` for *whichever* dialog session is currently open, keyed only on `state.ok`. If the user dismisses before a submission resolves and reopens the overlay with new unsaved content, the stale success arriving later silently closes the reopened dialog and discards the new content. Confirmed by tracing: `state` is `useActionState`'s only signal, `handleDialogClose` resets fields on every close, and nothing ties a `state` update back to the dialog "session" it belongs to. Fixed: added `generationRef`/`submissionGenerationRef`, bumped/stamped on open and submit respectively; the auto-close effect now skips when they don't match.
- **low, patch — fixed** — `src/app/(app)/add-idea-overlay.tsx` (grabber div, ~line 99) — the swipe-to-dismiss touch handlers are bound only to the visible 36×4px grabber pill, well under usable touch-target guidance, making the AC's swipe-down dismissal unreliable on a real device (outside-tap and the close button remain as working alternatives, hence low not medium). Fixed: touch handlers moved to a padded wrapper div; the visible pill nested inside keeps its original size.
- **medium, patch — fixed** — `e2e/idea-submit.spec.ts` — no test exercises `handleBackdropClick` (outside-tap dismiss), a spec-mandated AC; a regression inverting or dropping that check would ship with the suite green (verification-gap layer, evidence: repo-wide search found no backdrop-click coverage anywhere). Fixed: added an outside-tap test mirroring the Esc-dismiss test's shape.
- **low, patch — fixed** — `e2e/idea-submit.spec.ts` (Esc-dismiss test) — doesn't assert focus returns to the "Add Idea" trigger after dismiss, though that's an explicit AC line; relies entirely on native `<dialog>` focus-restoration with no automated check. Fixed: the test now asserts the trigger is focused after the dialog hides.
- **false** — blind-hunter: manual empty-field check in `actions.ts` returns the same fixed copy as a DAL/write failure, called "misleading" and "duplicate enforcement with no single source of truth." Refuted: the spec's Boundaries explicitly mandate exactly one fixed, generic error string for *any* failure ("`error` is fixed, display-ready copy" — not failure-type-specific), so returning it here is spec-compliant, not misleading. Confirmed via verification-gap's live mutation test that the manual check and the DAL catch path are behaviorally identical (no observable divergence).
- **false** — edge-case/blind-hunter overlap on the same whitespace issue as above, filed separately as a "claim" finding against the spec's "validate non-empty fields" line: folded into the single low/patch entry above (same root cause, not a second defect).
- **false** — blind-hunter: `idea.submitterId`'s `ON DELETE CASCADE` silently deletes a user's ideas if the user row is deleted, called an unintended data-loss path. Refuted: no user-deletion feature exists anywhere in the codebase (confirmed via repo-wide search) to reach this path, and the pattern exactly mirrors the existing `session.userId`/`account.userId` cascade convention already in `schema.ts` — not a deviation introduced by this story.
- **false** — blind-hunter: no visible feedback after a successful submit, since the idea list is out of scope for this story. Refuted: the frozen spec's own AC states the overlay "closes silently with no toast" — this is the mandated behavior, not an oversight.
- **low, rejected** — blind-hunter: no max length on `title`/`description`. Real gap, but unlikely to be hit in everyday use and the fix (length cap + UI enforcement) is more than a direct correction — rejected per triage rule.
- **low, rejected** — blind-hunter: `e2e/idea-submit.spec.ts`'s happy-path test doesn't assert the row was actually persisted, only that the dialog hides. Real gap, but the DAL-level happy path is already asserted in `ideas.test.ts`; adding a DB assertion to the e2e test is more than trivial for the added protection — rejected.
- **low, rejected** — blind-hunter: no test renders `add-idea-overlay.tsx` with a forced DAL failure to check the inline error/retained-values UI (only the Server Action's return shape is unit-tested). Real gap, but the behavior is already correct by inspection (fields are only reset in `handleDialogClose`, never on error) and no component-testing tool (e.g. React Testing Library) exists in this repo to add one cheaply — more than a trivial fix, rejected.
- **low, defer** — verification-gap: swipe-down dismiss has no automated test; forcing it needs Playwright touch-context config (`hasTouch`) not currently set up, more than a trivial addition, and it's a mobile-only affordance with working alternatives (outside-tap, close button, Esc on devices with a keyboard).
- **low, defer** — blind-hunter: the new `--bg-muted`/`--border-strong`/`--text-disabled`/`--error`/`--error-bg` tokens have no dark-mode counterparts. Pre-existing, not caused by this story: dark mode isn't wired up anywhere in the app (no `prefers-color-scheme` query, no `dark:` usage), and most existing tokens (`border-default`, `bg-page`, `text-primary`, etc.) already lack dark counterparts too.

## Design Notes

- Native `<dialog>` over a UI library: no Radix/shadcn dependency exists today; `showModal()`/`close()` gives focus trap, `Esc` handling, and `::backdrop` for free, satisfying the accessibility floor without a new dependency. Style the sheet-vs-dialog split responsively, e.g. a content wrapper positioned `fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto`.
- This is Zod's first real usage in the codebase (installed, previously unused): a small `z.object({ title: z.string().min(1), description: z.string().min(1) })` inside `createIdea` keeps validation testable at the DAL layer.

## Verification

**Commands:**
- `npm run lint` -- expected: clean
- `npm run build` -- expected: passes, including the strict TS check
- `npm run db:generate` -- expected: emits migration SQL for the new `idea` table with no manual edits needed
- `npm run test:integration` -- expected: new and existing DAL/action tests pass against real Postgres
- `npx playwright test e2e/idea-submit.spec.ts` -- expected: passes

**Manual checks (if no CLI):**
- Compare the overlay's visual result against `design/ux-design.pen` (via the `pencil` MCP tool) for spacing, token colors, and the sheet/dialog breakpoint — no automated visual diff covers this screen yet.
