<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UX reference for implementation

The canonical visual reference for building TeamPulse screens is `design/ux-design.pen` (open with the pen.dev app) — not the static files under `_bmad-output/planning-artifacts/ux-designs/ux-TeamPulse-2026-09-28/mockups/`. Those `.html` files are a frozen snapshot from the UX Finalize step; the `.pen` file is the live, maintained design and reflects the latest fixes (e.g. input alignment) and the current screen organization by navigation flow. Always check `design/ux-design.pen` for the current layout, component structure, and token values before implementing a screen.

`DESIGN.md` and `EXPERIENCE.md` in that same UX folder remain the source of truth for behavior, tokens, and rationale — the `.pen` file is the visual composition reference; both spines win on conflict with any mock.

<!-- bmad:context -->
<!-- Verified 2026-09-28 against 7475c7d. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## Policy — Definition of Done

- A change is not done until it passes: unit tests, automation/functional tests, lint, build, and UI verification. No exceptions.
- Lint: `npm run lint` must pass clean (eslint, `eslint.config.mjs`).
- Build: `npm run build` must pass — this also runs the project's strict TypeScript check (`tsconfig.json`), since `next.config.ts` does not set `typescript.ignoreBuildErrors`.
- Unit tests: TODO — Vitest is the decided framework, not yet installed. Add it, wire a `test` script, and gate on `npx vitest run` once scaffolded.
- Automation/functional tests (one gate): TODO — Playwright is the decided framework per the architecture spine (covers the five FR journeys), not yet installed. Add it, wire a `test:e2e` script, and gate on `npx playwright test` once scaffolded.
- UI verification: TODO — Percy is the decided tool, not yet installed. Gate is Percy's visual diff against baseline, wired into the Playwright run once both exist.

<!-- /bmad:context -->
