---
title: 'Percy Visual Regression Setup'
type: 'chore'
created: '2026-09-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'bfc9015100af11bc7df3c9c86a342ecdafddb43c'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AGENTS.md's Definition of Done requires "UI verification: ... Gate is Percy's visual diff against baseline, wired into the Playwright run" but Percy has never been installed — nothing in this repo catches a visually-wrong screen (missing background image, broken layout, wrong color) as long as the DOM/behavior assertions still pass. This gap is not hypothetical: Story 1.2's login page shipped with an abstract gradient standing in for a real photo the live design (`design/ux-design.pen`) already specified, and no automated check caught it.

**Approach:** Install `@percy/cli` and `@percy/playwright`, add `percySnapshot()` calls at the existing e2e specs' key visual states (login default/error, loading splash default/reduced-motion), add a `test:visual` script that runs Playwright under `percy exec`, and wire it into CI as an additional step after `test:e2e`. Percy needs a `PERCY_TOKEN` (from a Percy project the human creates) to actually compare against a baseline; without it, Percy's CLI no-ops (exits 0, uploads nothing) rather than failing, so this story ships the wiring but the human must supply the token before it starts actually gating anything.

## Boundaries & Constraints

**Always:** Snapshot only stable, already-authenticated states the existing specs already reach deterministically (login form, login error, loading splash default, loading splash reduced-motion) — reuse existing test setup/seeding, do not add new test-only routes or fixtures beyond what `e2e/login.spec.ts`/`e2e/loading.spec.ts` already establish. The `test:visual` script and CI step must be additive — `npm run test:e2e` (plain Playwright, no Percy) keeps working unchanged for local dev without a Percy account. CI's Percy step must not fail the build when `PERCY_TOKEN` is absent (Percy's own default behavior) — never invent a workaround that makes it hard-fail without a token.

**Never:** Do not create a Percy account, project, or token — that requires a human with billing/org access; leave a clear placeholder (`secrets.PERCY_TOKEN`) for the human to wire up. Do not snapshot every DOM state combinatorially — pick the handful of visual states above, not every hover/focus permutation. Do not remove or weaken any existing Playwright assertion to make room for a snapshot call.

</frozen-after-approval>

## Code Map

- `package.json` -- add `@percy/cli`, `@percy/playwright` (devDependencies); add `"test:visual": "percy exec -- playwright test"` script alongside existing `"test:e2e": "playwright test"`
- `e2e/login.spec.ts` -- add `percySnapshot(page, "Login - default")` after initial `/login` load and `percySnapshot(page, "Login - error")` after the wrong-password inline error renders (reuse the existing test flow, don't add new tests)
- `e2e/loading.spec.ts` -- add `percySnapshot(page, "Loading - reduced motion")` at the point the spec already asserts the static-ring computed styles
- `.github/workflows/ci.yml` -- add a step after the existing "E2E tests" step: `npm run test:visual`, with `PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}` in its `env:`
- `AGENTS.md` -- update the Definition of Done's "UI verification: TODO" line to reflect Percy is now installed and wired, noting the `PERCY_TOKEN` secret is still pending human setup

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- add Percy devDependencies + `test:visual` script
- [x] `e2e/login.spec.ts` -- add 2 `percySnapshot` calls (default, error states)
- [x] `e2e/loading.spec.ts` -- add 1 `percySnapshot` call (reduced-motion state)
- [x] `.github/workflows/ci.yml` -- add `test:visual` CI step with `PERCY_TOKEN` env wiring
- [x] `AGENTS.md` -- correct the stale "TODO — not yet installed" Percy line

**Acceptance Criteria:**
- Given `PERCY_TOKEN` is set locally (now available in `.env`), when `npm run test:visual` runs, then Playwright's own assertions still run and pass, and Percy actually uploads the 3 snapshots and reports a build URL (first run establishes the baseline; no prior baseline to diff against yet).
- Given `PERCY_TOKEN` is unset (e.g. a contributor without one), when `npm run test:visual` runs, then Playwright's own assertions still run and pass, and Percy skips/no-ops rather than failing the build.
- Given CI does not yet have `PERCY_TOKEN` configured as a repo secret, when CI runs the new step, then it behaves like the unset-token case above (no build failure) until a human adds the secret.

## Implementation Notes

All 5 execution tasks were already complete; this pass ran the verification commands and closed out the spec.

## Spec Change Log

## Review Triage Log

## Design Notes

- **Why not gate CI on Percy failing today:** there is no Percy project/token yet, and creating one requires a human (billing, org membership). Percy's CLI is designed to no-op without a token specifically so this kind of staged rollout (wire the code now, activate the gate later) doesn't require a fake/placeholder secret.
- **Why only 3 snapshots, not more:** matches the two screens this app currently has (Login, Loading); Epic 2's idea-board screens should add their own snapshots when built, not be retrofitted here.

## Verification

**Commands:**
- `npm run lint` -- ran, clean.
- `npm run build` -- ran, passes (TypeScript + Next.js build both succeed).
- `npm run test:visual` -- ran, all 4 Playwright tests pass. Percy itself reported `Invalid API token` and fell back to its no-op path (`Percy is not running, disabling snapshots`) rather than uploading the 3 snapshots — the `.env` `PERCY_TOKEN` value is not a valid/active Percy project token. This matches the *unset-token* acceptance criterion (build doesn't fail), not the *valid-token* one (upload + baseline). A human needs to supply a working `PERCY_TOKEN` (and the same value as the `PERCY_TOKEN` repo secret in CI) before Percy actually gates anything.
- `npm run test:e2e` -- ran, same 4 tests pass unchanged without Percy involved.

**Manual checks (if no CLI):**
- Confirmed `.github/workflows/ci.yml`'s new step references `secrets.PERCY_TOKEN` and does not hardcode any token value.
