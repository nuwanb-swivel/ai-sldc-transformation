# Tech Verification Review — TeamPulse Architecture Spine

Reviewed: /Users/swiveltech/Disk/Swivel/AINativeDevelopment/TeamPulse/_bmad-output/planning-artifacts/architecture/architecture-TeamPulse-2026-09-28/ARCHITECTURE-SPINE.md
Date of review: 2026-09-28
Method: cross-checked against `node_modules/next/dist/docs/` in the project (this repo runs a modified/forked Next.js — see project AGENTS.md) plus live web search for library/DB versions.

## 1. Next.js 16.3.6 / Proxy / Server Actions / Cache Components

**Verdict: Accurate, and independently confirmed both by web search and by the actual vendored docs in this repo.**

- **Version reality**: Web search confirms Next.js 16.3 reached stable August 3, 2026 (nextjs.org/blog/next-16-3, InfoQ, Vercel blog). A 16.3.6 patch by 2026-09-28 is plausible and matches what's pinned in `package.json` (`"next": "16.3.6"`) — not a hallucinated version.
- **`proxy.ts` replacing `middleware.ts`**: Confirmed directly from the project's own vendored docs, not just paraphrase:
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — explicit note: "The `middleware` file convention is deprecated and has been renamed to `proxy`." Version history table states: `v16.0.0` — "Middleware is deprecated and renamed to Proxy. Proxy defaults to the Node.js runtime."
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md` — confirms: "deprecated in Next.js 16 and renamed to proxy.js... All functionality remains the same — only the file and export names have changed."
  - The spine's AD-7 rule (proxy.ts only reads the session cookie, redirects unauthenticated requests, never queries DB or makes role decisions) matches the docs' own guidance: "Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone" (proxy.md, Execution order section) — i.e., the docs themselves back AD-7/AD-2's split, not just AD-7's paraphrase of it.
- **Cache Components / `cacheComponents`**: Confirmed via `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` and `02-guides/migrating-to-cache-components.md`. Cache Components are opt-in via `cacheComponents: true` in `next.config.ts`; without it, "All pages are dynamic by default" (migrating-to-cache-components.md line 140). This directly confirms AD-6's claim that leaving `cacheComponents` unset (default `false`) yields per-request/always-fresh reads — accurate, not asserted.
- **Server Actions**: The spine treats `'use server'` Server Actions as the sole mutation path (AD-1) and the docs corroborate that Server Functions are handled as POST requests to their route and are a first-class primitive independent of Route Handlers — consistent with the spine's framing. No contradiction found.

No issues found in this section.

## 2. Drizzle ORM — 0.45.x current stable, 1.0 still beta

**Verdict: Confirmed accurate via web search.**

- npm / Drizzle ORM's own "latest releases" page and npm registry data show the latest stable published version is **0.45.3** (published ~7 days before search date), consistent with the spine's `0.45.x` pin.
- The spine's caution against pinning to a `1.0.0-beta.*` tag is a reasonable hedge; search results (PkgPulse "Drizzle ORM v1 vs Prisma 6 vs Kysely 2026") indicate a 1.0 line exists but is being discussed as distinct from the stable 0.45.x — consistent with "1.0 still beta" framing. This was appropriately flagged `[ASSUMPTION]` and web-verified per the spine's own annotation.

No issues found in this section.

## 3. Better Auth — current recommendation, Lucia deprecated, NextAuth/Auth.js maintenance-only

**Verdict: Confirmed accurate via web search, and slightly under-states how thoroughly this has consolidated.**

- Lucia: confirmed deprecated. Multiple sources state Lucia v3 was sunset by its maintainer (decision publicized ~March 2025), the npm package is flagged deprecated, and it has been repositioned as an "auth architecture guide" rather than a library. Not viable for new projects per current sources.
- Better Auth: confirmed as the current recommended choice for new TypeScript/Next.js projects — described as fastest-growing, TypeScript-native, with an expanding official plugin ecosystem (2FA, magic links, passkeys, org management, admin, OAuth).
- Auth.js/NextAuth: confirmed maintenance/security-only. One source adds a detail the spine doesn't mention: Auth.js is reported as "maintained for security only, **under the Better Auth umbrella since September 2025**" — i.e., organizational consolidation, not just two competing libraries with one declining. This strengthens (doesn't contradict) the spine's claim but is worth noting as additional context the spine could have cited for a stronger rationale.

No issues found in this section; this assumption was appropriately marked `[ASSUMPTION]` and is web-corroborated.

## 4. PostgreSQL 17.x as "reasonable current pin"

**Verdict: MEDIUM severity finding — technically supported/valid, but not actually the current major version, and the spine's phrasing risks being read as "latest."**

- Web search (postgresql.org official news) shows **PostgreSQL 18 has been the current major release since ~September 2025**, with 18.6 released August 13, 2026, and **PostgreSQL 19 Beta 4 already out (September 24, 2026)** — i.e., a year into the 18.x line, with 19 approaching.
- PostgreSQL 17.x (17.10, per the same release-notes page) is still a supported, patched line — not EOL, not a bad choice — but it is one major version behind current stable, not "the" current version. The spine states `PostgreSQL 17.x` as an `[ASSUMPTION]` without noting that 18.x is the actual current major release; a reader could reasonably assume 17.x is "current" rather than "still-supported but one behind."
- This is a greenfield MVP with a managed-Postgres deployment target (Neon/Vercel Postgres per the Deployment section) — both of those providers support PG 18 as of the same timeframe, so there's no obvious compatibility reason to prefer 17 over 18 that the spine states. This looks like it may not have been web-checked against the *current* major version, only checked as "a reasonable pin" in isolation.
- **Recommendation**: Either re-verify whether 17.x was a deliberate choice (e.g. managed-provider default, ecosystem/tooling compatibility) and state that reason, or update the pin to 18.x as the actual current major version.

## 5. React 19.2.8, TypeScript ^5, Tailwind ^4 — sanity check

**Verdict: Accurate / not hallucinated. Low-severity note only.**

- **React 19.2.8**: Confirmed real — GitHub release tag `v19.2.8`, published July 21, 2026, matches `package.json`. Not fabricated.
  - **Low-severity note**: React 19.3.0 was released September 9, 2026 (before this spine's 2026-09-28 date), so 19.2.8 is not the absolute latest minor at time of writing — but pinning to an already-installed, working version rather than chasing latest-minor is a defensible engineering choice for an MVP, not a factual error. Not flagging as an issue with the spine's claims, just noting it wasn't the newest available.
- **TypeScript `^5`**: Reasonable, unremarkable — TypeScript has been on the 5.x line for several years; a caret range is appropriately non-specific and not a stale/hallucinated pin.
- **Tailwind CSS `^4`**: Confirmed real and current — stable Tailwind v4 line, with 4.3.x as the latest published version (4.3.3) as of the search. Matches `package.json`'s `^4` devDependency pins for `tailwindcss` and `@tailwindcss/postcss`.

No issues found in this section beyond the minor observation above.

## Summary of Findings

| # | Finding | Severity |
| --- | --- | --- |
| 1 | PostgreSQL pin (17.x) is one major version behind actual current stable (18.x, with 19 already in beta); spine doesn't state a reason for staying on 17 over 18 despite the deployment targets (Neon/Vercel Postgres) supporting 18 | Medium |
| 2 | React 19.2.8 is real but not the latest minor available (19.3.0 shipped before the spine's date) — informational only, not an error | Low |
| 3 | Better Auth / Auth.js relationship is even tighter than stated (Auth.js reportedly under the Better Auth org since Sept 2025) — spine's claim is correct but could be strengthened, not a defect | Low |
| — | Next.js 16.3.6, Proxy/middleware rename, Cache Components default-off behavior, Server Actions framing | Confirmed accurate against both web search and the project's own vendored docs — no issues |
| — | Drizzle ORM 0.45.x stable / 1.0 still beta | Confirmed accurate via web search — no issues |
| — | TypeScript ^5, Tailwind ^4 | Confirmed real, current, unremarkable — no issues |

Overall, every committed technology claim in the spine appears to have been genuinely web-verified or cross-checked against the actual project docs (the `[ASSUMPTION]` tags correctly mark exactly the items that needed it, and those items check out). The one substantive gap is the PostgreSQL major-version pin, which is defensible but not clearly justified against the current stable release.
