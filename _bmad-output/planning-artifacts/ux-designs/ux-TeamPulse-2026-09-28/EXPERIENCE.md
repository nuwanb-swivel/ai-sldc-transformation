---
name: TeamPulse
status: final
sources:
  - "{planning_artifacts}/briefs/brief-TeamPulse-2026-09-28/brief.md"
  - "{planning_artifacts}/prds/prd-TeamPulse-2026-09-28/prd.md"
updated: 2026-09-28
---

# TeamPulse — Experience Spine

Mobile-first responsive web app for internal idea submission, upvoting, and status tracking. `DESIGN.md` is the visual identity reference.

## Foundation

Single-surface responsive web, plain Tailwind (no component library dependency). `[ASSUMPTION]` Mobile-first per the brief's framing ("most employees will likely check and vote on ideas in spare moments, not at a desk"): the phone layout is the primary design target, and desktop simply renders the same single-column layout at a constrained max width (see `DESIGN.md.Layout & Spacing`). Two roles share one app shell: **Employee** (submit, browse, upvote) and **Admin** (also changes status) — the PRD requires the status control to be entirely absent from the UI for non-Admins, not merely disabled (FR-4). Auth-gated end to end; no anonymous access, no SSO in v1.

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| Loading | App open, before auth/session state is known | Branded splash while the app determines whether to show Login or the Idea list |
| Login | App open (unauthenticated) | Username/password auth gate |
| Idea list | App open (authenticated) / primary landing surface | Every idea, all statuses, title + status + upvote count |
| Idea detail | Tap a card in the idea list | Full description, upvote, status badge, (Admin only) status control |
| Add Idea | Persistent action, reachable from list and detail | Title + description, submit |

`[ASSUMPTION]` Idea detail is a full view (not a modal/expand-in-place) — PRD leaves this open, and a full view keeps the pattern identical and simple on both mobile and desktop. `[ASSUMPTION]` "Add Idea" opens as an overlay (sheet on mobile, centered dialog on desktop) rather than navigating away, so posting an idea never loses the submitter's place in the list. `[ASSUMPTION]` Loading is not a PRD-named surface — it's the brief instant every auth-gated app has between "app opens" and "we know whether you're logged in," specced here so it isn't left to a blank white flash or a generic spinner.

No settings surface, no search/filter surface, no notifications surface — all explicitly out of v1 scope per the PRD.

→ Composition reference: [`design/ux-design.pen`](../../../../design/ux-design.pen) (live, maintained — use this for implementation), organized left-to-right by this navigation flow (Login → Idea List → Idea Detail → Add Idea), default state on top and branch/alt states below. The static [`mockups/idea-list.html`](mockups/idea-list.html), [`mockups/idea-detail.html`](mockups/idea-detail.html), [`mockups/add-idea-overlay.html`](mockups/add-idea-overlay.html), [`mockups/login.html`](mockups/login.html) are a frozen Finalize-time snapshot — do not build against them if they've drifted from the `.pen` file. Spine wins on conflict with either.

## Voice and Tone

Microcopy stays plain and literal — no exclamation points, no gamified language, no "Great job!" framing. Brand posture lives in `DESIGN.md.Brand & Style`.

| Do | Don't |
|---|---|
| "12 upvotes" | "12 people love this! 🎉" |
| "Under Review" | "We're on it!" |
| "Submit idea" | "Share your genius idea!" |
| "No ideas yet. Be the first to add one." | "It's quiet in here... too quiet!" |
| Status change confirmation: "Marked as Planned." | "Woohoo, planned!" |

## Component Patterns

Behavioral; visual specs live in `DESIGN.md.Components`.

| Component | Use | Behavioral rules |
|---|---|---|
| Idea card | Idea list | Tap anywhere except the upvote control opens idea detail. Upvote control is its own tap target so a scanning user can upvote without opening detail. |
| Upvote control | Idea card, idea detail | Toggles once from inactive → active on tap; optimistic update (count increments immediately, reconciles with server). No un-upvote (FR-3) — a second tap on an already-active control does nothing (no error, no toast). |
| Status badge | Idea card, idea detail | Identical rendering in both places — same color, same label, always visible (never hidden or truncated). |
| Add Idea overlay | Global, persistent entry point | Two required fields: title, description. Submit disabled until both are non-empty. On success, closes and returns to the surface it was opened from, with the new idea visible at the top of the list (assumes newest-first default, PRD Open Question 6). |
| Admin status control | Idea detail, Admin role only | Renders only when the signed-in user is Admin — absent (not disabled/grayed) for Employees, per FR-4. A plain forward-only stage picker (New → Under Review → Planned → Done); selecting a stage applies immediately, no confirm dialog. `[ASSUMPTION]` no requirement to move status backward, so the control does not need to support it. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| App bootstrap | Loading | Full-screen branded splash (see `Motion & Loading` below) while session/auth state resolves. Resolves to Login (unauthenticated) or Idea list (authenticated) — never resolves *to* itself, so there's no "stuck loading" end state to design for. |
| Cold load | Idea list | Skeleton rows matching card layout (title bar + badge + count placeholders). Resolves on data. |
| Empty list | Idea list | "No ideas yet. Be the first to add one." + primary Add Idea action. |
| Idea submitted | Add Idea overlay → Idea list | Overlay closes; new idea appears at top of list; no confirmation toast needed — the card appearing *is* the confirmation. |
| Already upvoted | Idea card, idea detail | Control renders in its active visual state permanently; re-tap is a no-op, not an error. |
| Admin changes status | Idea detail | Badge updates in place immediately (optimistic). No toast; the badge change is the confirmation. Employees who contributed are not notified — they discover it on next visit (explicit v1 non-goal). |
| Login failure | Login | Inline error under the form: "Incorrect username or password." Fields retain entered username. |
| Submit/save failure | Add Idea overlay, status change | Inline error, form/state retained so the user can retry without re-entering data. `[ASSUMPTION]` no PRD detail on error copy or retry pattern; retains-and-retry is assumed as the safe default for a low-stakes internal tool. |

## Motion & Loading

The only designed motion in TeamPulse — everything else in the app (badge updates, upvote counts, overlay open/close) is a state swap, not an animation, per the restrained brand posture.

- **What plays** — on the `Loading` screen (`DESIGN.md.Loading Screen`), 2–3 concentric rings in `{colors.brand-primary}` expand outward from behind the app-icon chip and fade out as they grow, looping continuously — a literal "pulse" reference, not a generic spinner. The icon itself does not move; only the rings animate.
- **Timing** `[ASSUMPTION]` (no PRD/brief guidance on motion) — one ring cycle every ~2s, rings staggered evenly (a new ring starts roughly every ~0.7s) so at least one is always mid-fade; `ease-out` on both scale and opacity (fast start, slow fade), not linear — a linear pulse reads mechanical rather than alive.
- **Minimum/maximum display time** `[ASSUMPTION]` — no artificial minimum; if session resolution is instant, Loading may not render at all. No maximum either — if bootstrap genuinely hangs, that's a network/auth failure to handle via the existing error-state pattern (`State Patterns` row), not a loading-screen timeout affordance (out of scope for v1).
- **Reduced motion** — respect `prefers-reduced-motion`: replace the expanding rings with a single static ring at ~40% opacity (no motion, no loop) rather than removing the ring treatment entirely.
- **Implementation** — build as a CSS `@keyframes` animation (`transform: scale()` + `opacity`, staggered `animation-delay` per ring), not JS-driven — this is a decorative loop with no interaction dependency. The `.pen` file's shader-based ring (`design/pulse-ring.glsl`) is a live design reference for the motion curve, not something to port into the app as-is.

## Interaction Primitives

Tap/click-first — this is a phone-in-spare-moments tool, not a keyboard-driven power tool.

- Tap idea card (outside upvote control) → open idea detail.
- Tap upvote control → optimistic upvote, one-way only.
- Tap persistent Add Idea action (from list or detail) → opens overlay.
- Overlay: tap outside / swipe down (mobile) / `Esc` (desktop) → dismiss without submitting, if fields are empty; if fields have content, `[ASSUMPTION]` dismiss discards silently rather than confirming — low-stakes short-form content, a confirm dialog would be disproportionate friction for an internal feedback tool.
- No drag, no swipe-to-act, no keyboard shortcuts — `[ASSUMPTION]` no signal in the PRD that TeamPulse has a power-user audience distinct from "all employees," so no shortcut layer is designed.

**Banned:** infinite scroll `[ASSUMPTION]` (pagination or "load more" instead — PRD doesn't specify, but an unranked open-ended board should not risk implying an infinite feed of ideas), un-upvote, any notification/alert UI, drag-to-reorder, hover-only affordances (this is touch-first).

## Accessibility Floor

`[ASSUMPTION]` No accessibility standard was named in the brief or PRD (explicit gap). WCAG 2.2 AA is assumed as the floor for an internal company tool, consistent with general workplace-software norms. Visual contrast ratios live in `DESIGN.md`.

- All status badges are distinguishable by text label, not color alone (color-blind safe).
- Upvote control has an accessible name reflecting state: "Upvote — 12, not yet upvoted" / "Upvoted — 12".
- Add Idea overlay traps focus while open; `Esc` or explicit close returns focus to the triggering element.
- Admin status control, where rendered, is a native/ARIA-compliant select or radio-group — never a div-based custom widget without keyboard support.
- Form errors (login, add idea) are associated with their field via `aria-describedby`, not color/icon alone.

## Key Flows

### Flow 1 — Priya submits and later sees it land (Priya, operations coordinator)

1. In a meeting, Priya thinks of a process improvement. Later, on her phone, she opens TeamPulse from a home-screen bookmark.
2. Idea list loads — she taps the persistent Add Idea action.
3. Overlay opens. She types a short title and description, taps Submit.
4. Overlay closes; her idea appears at the top of the list, badged **New**, 0 upvotes.
5. Days later, she reopens the app. Her idea now shows the **Under Review** badge and an upvote count of 3.
6. **Climax:** She doesn't have to ask anyone whether her idea was seen — the badge and the count are sitting right there on the surface she already knows to check. That's the whole proof.

Failure: submit fails (network) → inline error on the overlay, her typed text is retained, she retries without retyping.

### Flow 2 — Marcus triages the backlog (Marcus, designated Admin)

1. Marcus opens TeamPulse for his weekly check-in.
2. Idea list loads with all ideas, all statuses visible. He scans by upvote count to find what's gaining traction.
3. He taps a high-upvote idea still badged **New**, landing on its detail view.
4. Because he's Admin, the status control is visible. He moves it to **Under Review**.
5. Badge updates immediately in the detail view; he taps back to the list and confirms it now shows **Under Review** there too.
6. **Climax:** He repeats this for a handful of ideas in a few minutes — no separate admin console, no confirmation dialogs slowing him down, just the same surface everyone else sees, with one extra control. The whole triage pass fits inside the same five minutes it takes to scan the list.

Failure: he mis-taps and advances the wrong idea's status — `[ASSUMPTION]` since the control has no backward guard, he simply reopens detail and moves it back; no confirm-dialog cost was designed in, so the correction is equally cheap.
