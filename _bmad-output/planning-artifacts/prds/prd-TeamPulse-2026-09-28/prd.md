---
title: TeamPulse
status: final
created: 2026-09-28
updated: 2026-09-28
---

# PRD: TeamPulse

## 0. Document Purpose

This PRD defines the MVP for TeamPulse, an internal, company-wide feedback and idea board, for the engineering team building it and any stakeholder reviewing scope. It builds on [brief.md](../../briefs/brief-TeamPulse-2026-09-28/brief.md), which established the product's purpose, stakes, and boundaries; this document does not repeat that reasoning, only the decisions that carry forward. Features are grouped with globally-numbered Functional Requirements (FR-N) nested underneath; assumptions are tagged inline where the brief or conversation left a gap, and indexed in §9.

## 1. Vision

TeamPulse gives every employee a single, durable place to submit an idea, see what others have proposed, and back the ones they care about with an upvote. Every idea carries a visible status — New, Under Review, Planned, Done — so contributors can tell whether their input was seen and acted on, instead of it disappearing into a Slack thread. An Admin moves ideas through that pipeline as decisions are made.

This MVP is deliberately narrow: submit, browse, upvote, track status. It exists to get a real, company-wide feedback loop running quickly so the team can learn from actual usage — what people submit, what they vote for, whether status changes drive return visits — before investing in integrations (Slack) or automation. The bar for v1 is simple: it replaces informal, ephemeral channels with one visible, persistent one.

## 2. Target User

### 2.1 Jobs To Be Done

- As an employee, I want to raise an idea or piece of feedback somewhere it won't get lost, so it has a chance of being acted on.
- As an employee, I want to see what others have proposed and back the ones I agree with, so collective demand is visible instead of scattered across private conversations.
- As an employee, I want to know whether my idea was seen and what's happening to it, so I know participating is worth my time.
- As an Admin, I want a simple way to move ideas through a status pipeline as decisions are made, without a heavyweight process.

### 2.2 Non-Users (v1)

- People outside the organization — TeamPulse is internal-only in v1; there is no public or customer-facing surface.
- Anyone needing to interact with TeamPulse via Slack or another integrated tool — v1 is a standalone web app only. `[NON-GOAL for MVP]`

### 2.3 Key User Journeys

- **UJ-1. An employee submits an idea and later sees it move.**
  - **Persona + context:** Priya, an operations coordinator, thinks of a process improvement during a meeting and wants to raise it before she forgets.
  - **Entry state:** Authenticated on her phone, opening TeamPulse from a home-screen bookmark.
  - **Path:** Opens the app → taps "Add Idea" → types a short title and description → submits. Days later, she opens the app again, sees her idea now tagged "Under Review," and notices three other people have upvoted it.
  - **Climax:** Seeing the status change and the upvote count — proof the idea was seen and that others want it too.
  - **Resolution:** She feels submitting was worth it and browses the list for other ideas to upvote.
  - **Edge case:** If no one has upvoted or changed status after some time, the idea just sits at "New" — there is no reminder or nudge in v1; this is a known limitation, not a bug. `[ASSUMPTION: no idea-aging or stale-idea handling in v1 — see §9 Assumptions Index.]`

- **UJ-2. An Admin triages incoming ideas.**
  - **Persona + context:** Marcus, designated Admin, checks TeamPulse weekly to keep the pipeline current.
  - **Entry state:** Authenticated, logged in as a user with the Admin role.
  - **Path:** Opens the idea list → sorts or scans by upvote count → opens an idea → changes its status from "New" to "Under Review" (or further along, as decisions are made) → repeats for other ideas.
  - **Climax:** The list now reflects real decisions, visible to everyone the next time they check.
  - **Resolution:** Contributors whose ideas moved see the change next time they open the app; no notification is sent in v1.

## 3. Glossary

- **Idea** — A single piece of feedback or suggestion submitted by an Employee. Has a title, description, submitter, upvote count, and Status. The core object in TeamPulse.
- **Employee** — Any authenticated TeamPulse user. Can view Ideas, submit an Idea, and upvote Ideas. Every Admin is also an Employee.
- **Admin** — An Employee additionally permitted to change an Idea's Status. Confirmed as a small, explicitly named group of trusted individuals assigned by whoever operates the system — not a broad role granted by job title (e.g. not "all people-managers") and not self-service.
- **Status** — An Idea's position in the pipeline. One of, in order: **New** (default on submission) → **Under Review** → **Planned** → **Done**. Only an Admin can change it; an Idea holds exactly one Status at a time.
- **Upvote** — A single Employee's signal of support for an Idea. One Employee can upvote a given Idea at most once. `[ASSUMPTION: upvotes are single-toggle (on/off, not weighted or repeatable) and not anonymous to the system, even though the identity of who upvoted is not shown in the UI in v1 — see FR-3.]`

## 4. Features

### 4.1 Idea Submission

**Description:** Any authenticated Employee can submit a new Idea from anywhere in the app via a persistent "Add Idea" action. Submission is intentionally minimal — a title and a description — to keep friction low, since low friction is the entire premise behind the >70%-submit-in-month-1 target. Realizes UJ-1.

**Functional Requirements:**

#### FR-1: Submit an Idea

An Employee can submit a new Idea consisting of a title and a description.

**Consequences (testable):**
- A submitted Idea is created with Status = New, submitter = the authenticated Employee, upvote count = 0, and a creation timestamp.
- Title is required and non-empty; description is required and non-empty. `[ASSUMPTION: both fields required, with no minimum/maximum length specified — reasonable technical defaults apply (e.g., a short max length to prevent abuse), left to implementation.]`
- The new Idea appears in the Idea list (FR-2) immediately after submission, with no moderation or approval gate before it becomes visible.

**Out of Scope:**
- Attachments, images, or rich-text formatting in the description.
- Editing or withdrawing a submitted Idea. `[NON-GOAL for MVP]`
- Categories, tags, or duplicate detection against existing Ideas. `[NON-GOAL for MVP]`

### 4.2 Idea Browsing

**Description:** Every Employee can view all submitted Ideas in one list, which is the shared, persistent record that replaces scattered informal channels. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-2: View all Ideas

An Employee can view a list of all submitted Ideas, each showing its title, current Status, and upvote count.

**Consequences (testable):**
- The list includes Ideas in every Status (New, Under Review, Planned, Done) — nothing is hidden from view by default.
- An Employee can open an Idea to see its full description.
- List ordering: default sort is newest-first, confirmed sufficient for v1; sort/filter by Status or upvote count is deferred to a later version.

**Out of Scope:**
- Search, filtering, or comments/discussion on an Idea. `[NON-GOAL for MVP]`

### 4.3 Upvoting

**Description:** Any Employee can upvote an Idea to signal support, surfacing real collective demand instead of leaving it invisible in private conversation. Realizes UJ-1.

**Functional Requirements:**

#### FR-3: Upvote an Idea

An Employee can upvote any Idea, once per Idea.

**Consequences (testable):**
- Upvoting increments the Idea's upvote count by 1 and is reflected in the Idea list without a page reload delay beyond normal request latency.
- An Employee cannot upvote the same Idea a second time; the UI reflects that they have already upvoted it.
- An Employee can upvote their own submitted Idea. `[ASSUMPTION: self-upvoting is allowed — not restricted, since the brief did not raise gaming/abuse as a concern for an internal, company-wide tool.]`
- Un-upvoting (retracting a prior upvote) is out of scope for v1. `[ASSUMPTION]`

### 4.4 Status Pipeline & Admin Triage

**Description:** Every Idea moves through a fixed, linear pipeline — New → Under Review → Planned → Done — giving contributors visible proof their input was seen. Only an Admin can change an Idea's Status. Realizes UJ-2.

**Functional Requirements:**

#### FR-4: Admin changes an Idea's Status

An Admin can change any Idea's Status to any of the four defined values (New, Under Review, Planned, Done).

**Consequences (testable):**
- Only users with the Admin role can change Status; a non-Admin Employee has no UI path or API access to do so.
- A Status change is reflected in the Idea list and detail view for all Employees on next view — no notification is sent. `[ASSUMPTION]`
- Status changes are not restricted to forward-only movement — an Admin can move an Idea backward, e.g., Planned back to Under Review. Confirmed as the intended v1 behavior.

**Feature-specific NFRs:**
- Only one role distinction exists in v1 (Employee vs. Admin) — no per-idea ownership or approval workflow.

**Notes:**
- Admin is a small, explicitly named group of trusted individuals, provisioned manually (not by job title or self-service) — see Glossary. The exact provisioning mechanism (config flag, database field, invite flow) is left to implementation.

### 4.5 Authentication

**Description:** TeamPulse is authenticated end-to-end; there is no anonymous or public access. Login is simple username/password, matching this MVP's internal-only, non-public scope.

**Functional Requirements:**

#### FR-5: Authenticate via username and password

A person must authenticate with a username and password before accessing any TeamPulse feature.

**Consequences (testable):**
- All routes and API endpoints (view, submit, upvote, admin status change) require an authenticated session.
- An unauthenticated request is redirected to login (web) or rejected (API).
- Accounts are Admin-provisioned, not self-registration — confirmed as the intended v1 mechanism for this company-wide internal tool. The specific provisioning workflow (config flag, database field, invite flow) is left to implementation.

**Out of Scope:**
- SSO / SAML / OAuth against a corporate identity provider. `[NON-GOAL for MVP]`
- Password reset flow details, MFA. `[ASSUMPTION: standard password-reset-via-email is assumed necessary at minimum for a real, company-wide product, but full spec is left to implementation/addendum.]`

## 5. Non-Goals (Explicit)

- TeamPulse is not a general-purpose ticketing or project-management tool — no assignees, due dates, sub-tasks, or work tracking beyond the four-stage Status pipeline.
- TeamPulse does not integrate with Slack or any other external tool in v1. That is explicit, planned future scope, not a rejected idea.
- TeamPulse does not send notifications (status-change alerts, digest emails, etc.) in v1.
- TeamPulse does not support comments/discussion, tagging/categorization, or anonymous submission in v1.
- TeamPulse does not support editing or withdrawing a submitted Idea in v1.

## 6. MVP Scope

### 6.1 In Scope

- View all submitted Ideas (FR-2)
- Submit a new Idea (FR-1)
- Upvote an Idea, once per Employee per Idea (FR-3)
- Four-stage Status pipeline: New → Under Review → Planned → Done, Admin-only to change (FR-4)
- Username/password authentication, all features gated behind login (FR-5)
- Mobile-first responsive web design

### 6.2 Out of Scope for MVP

- Slack integration and automated workflows — deferred to v2, explicitly planned. `[NOTE FOR PM]` This is the stated long-term differentiator; revisit as soon as MVP usage data exists.
- Comments/discussion on an Idea
- Categories or tags
- Notifications (status-change alerts)
- Editing or withdrawing your own submitted Idea
- Duplicate idea detection/merging
- Anonymous submission
- SSO / corporate identity provider integration
- Un-upvoting / retracting a vote

*(The six items above were undecided in the brief; confirmed as Out of Scope for v1 — see §9 Assumptions Index.)*

## 7. Success Metrics

**Primary**
- **SM-1**: Adoption — more than 70% of the organization submits at least one Idea within the first month of launch. Validates FR-1, FR-5 (submission must be low-friction and accessible enough to reach this bar).

**Secondary**
- **SM-2**: Pipeline throughput — number of Ideas reaching Planned or Done status, tracked monthly. Validates FR-4. Signals the pipeline is producing real decisions, not just collecting submissions.
- **SM-3**: Engagement depth — average upvotes per Idea. Validates FR-3. Signals people are voting, not just submitting once and leaving.
- **SM-4**: Return usage — share of Employees who open TeamPulse more than once in a month. Validates FR-2, FR-3.

**Counter-metrics (do not optimize)**
- **SM-C1**: Submission volume alone is not a success signal if upvote and return-usage numbers stay flat — a spike of one-off submissions with no follow-on engagement means people are venting once, not adopting the tool. Counterbalances SM-1.

Confirmed by the user (2026-09-28): SM-2 through SM-4 and SM-C1 are the right secondary/counter-metrics to track for v1, as proposed.

## 8. Open Questions

All open questions from the previous revision were reviewed and resolved with the user on 2026-09-28. None remain outstanding for v1. For the record:

1. ~~Who exactly holds the Admin role, and how are Admin accounts provisioned?~~ **Resolved:** a small, explicitly named group of trusted individuals, manually provisioned — not a broad role by job title, not self-service. (§4.4, §Glossary)
2. ~~Is there a real existing process this replaces, or is this greenfield?~~ **Resolved:** greenfield — no real existing process (Slack channel, spreadsheet, suggestion box) is being replaced. Informational for rollout messaging; no v1 build impact.
3. ~~Should the six deferred-scope items (§6.2) stay Out of Scope?~~ **Resolved:** yes, confirmed Out of Scope for v1 as previously defaulted. (§6.2)
4. ~~Account provisioning: self-registration vs. Admin-provisioned?~~ **Resolved:** Admin-provisioned, confirming the prior default. (§4.5)
5. ~~Should Status changes be forward-only?~~ **Resolved:** no — free movement in either direction, confirming the prior default. (§4.4)
6. ~~Does the Idea list need sort/filter for v1?~~ **Resolved:** no — newest-first only for v1, confirming the prior default. (§4.2)
7. ~~Are the proposed secondary success metrics and counter-metric right?~~ **Resolved:** yes, confirmed as proposed. (§7)

## 9. Assumptions Index

All items below were open assumptions in the previous revision and are now user-confirmed decisions (2026-09-28), retained here for traceability.

- §2.3 UJ-1 — No idea-aging, staleness handling, or reminder mechanism in v1. *(Not raised as an Open Question; carried as a standing v1 limitation.)*
- §3 Glossary (Admin) — Admin is a small, explicitly named group of trusted individuals, manually provisioned. **Confirmed.**
- §3 Glossary (Upvote) — Upvotes are single-toggle, not weighted or repeatable; upvoter identity not shown in UI. *(Not raised as an Open Question; carried as a standing v1 design decision.)*
- §4.1 FR-1 — Title/description both required; no explicit length limits specified beyond reasonable technical defaults. *(Not raised as an Open Question; standing implementation default.)*
- §4.2 FR-2 — Default list sort is newest-first; sort/filter not required for v1. **Confirmed.**
- §4.3 FR-3 — Self-upvoting allowed; un-upvoting out of scope for v1. *(Not raised as an Open Question; standing v1 design decision.)*
- §4.4 FR-4 — No notification sent on Status change; Status changes are not restricted to forward-only movement. **Confirmed** (forward/backward movement).
- §4.5 FR-5 — Accounts are Admin-provisioned, not self-registration; standard password-reset-via-email assumed necessary at minimum. **Confirmed** (provisioning mechanism); password-reset detail remains a standing implementation default.
- §6.2 — Six previously-undecided scope items from the brief resolved to Out of Scope for v1. **Confirmed.**
- §7 — Secondary success metrics and counter-metric. **Confirmed** as proposed.
