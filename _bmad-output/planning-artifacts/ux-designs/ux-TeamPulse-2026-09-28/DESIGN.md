---
name: TeamPulse
description: Internal idea board, built on the organization's shared design-token system (brand direction: Clean + Intelligent + Trustworthy + Enterprise + Human).
status: final
sources:
  - "{planning_artifacts}/briefs/brief-TeamPulse-2026-09-28/brief.md"
  - "{planning_artifacts}/prds/prd-TeamPulse-2026-09-28/prd.md"
updated: 2026-09-28
colors:
  brand-primary: '#5B5CF6'
  brand-primary-hover: '#4B4CE6'
  brand-primary-light: '#EEEEFF'
  brand-primary-subtle: '#F7F7FF'
  brand-dark: '#111318'
  brand-black: '#090A0D'
  brand-white: '#FFFFFF'
  text-primary: '#111318'
  text-secondary: '#5F636D'
  text-muted: '#8B909A'
  text-disabled: '#B5B8C0'
  text-inverse: '#FFFFFF'
  bg-page: '#FFFFFF'
  bg-subtle: '#F7F8FA'
  bg-muted: '#F1F2F5'
  bg-dark: '#111318'
  border-light: '#EAEBEF'
  border-default: '#DADCE2'
  border-strong: '#C3C6CE'
  success: '#20A66A'
  success-bg: '#EAF8F1'
  warning: '#E8A317'
  warning-bg: '#FFF7E5'
  error: '#D94A4A'
  error-bg: '#FDEEEE'
  info: '#4C7FF0'
  info-bg: '#EEF3FF'
  surface-dark-card: '#1B1E27'
  surface-dark-input: '#20232E'
  border-dark: '#2D3140'
  text-dark-secondary: '#A6ABB8'
  text-dark-muted: '#74798A'
  error-bg-dark: '#3A1E20'
  error-dark: '#FF7A7A'
typography:
  font-primary:
    note: '"Inter", "Helvetica Neue", Arial, sans-serif'
  display:
    fontFamily: '{typography.font-primary}'
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  heading:
    fontFamily: '{typography.font-primary}'
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.2'
  body:
    fontFamily: '{typography.font-primary}'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label:
    fontFamily: '{typography.font-primary}'
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  caption:
    fontFamily: '{typography.font-primary}'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
  content-max-width: 768px
  page-padding-mobile: 20px
  page-padding-tablet: 32px
  page-padding-desktop: 48px
  content-gap: 32px
components:
  button-primary:
    background: '{colors.brand-primary}'
    background-hover: '{colors.brand-primary-hover}'
    foreground: '{colors.text-inverse}'
    radius: '{rounded.md}'
    height: 48px
  add-idea-fab:
    background: '{colors.brand-primary}'
    foreground: '{colors.text-inverse}'
    radius: '{rounded.full}'
    shadow: '0 4px 12px rgba(16, 18, 24, 0.06)'
  idea-card:
    background: '{colors.bg-page}'
    border: '{colors.border-light}'
    radius: '{rounded.lg}'
    padding: '{spacing.4}'
  status-badge-new:
    background: '{colors.bg-muted}'
    foreground: '{colors.text-secondary}'
    radius: '{rounded.full}'
  status-badge-review:
    background: '{colors.warning-bg}'
    foreground: '{colors.warning}'
    radius: '{rounded.full}'
  status-badge-planned:
    background: '{colors.info-bg}'
    foreground: '{colors.info}'
    radius: '{rounded.full}'
  status-badge-done:
    background: '{colors.success-bg}'
    foreground: '{colors.success}'
    radius: '{rounded.full}'
  upvote-control:
    background: '{colors.bg-muted}'
    foreground: '{colors.text-secondary}'
    radius: '{rounded.full}'
  upvote-control-active:
    background: '{colors.brand-primary-light}'
    foreground: '{colors.brand-primary}'
    radius: '{rounded.full}'
  add-idea-overlay:
    background: '{colors.bg-page}'
    radius: '{rounded.lg}'
    shadow: '0 12px 32px rgba(16, 18, 24, 0.08)'
  input:
    background: '{colors.bg-page}'
    border: '{colors.border-default}'
    border-focus: '{colors.brand-primary}'
    radius: '{rounded.md}'
    height: 48px
  focus-ring:
    value: '0 0 0 3px rgba(91, 92, 246, 0.20)'
  admin-status-control:
    background: '{colors.bg-page}'
    border: '{colors.border-default}'
    active-background: '{colors.brand-primary}'
    active-foreground: '{colors.text-inverse}'
    radius: '{rounded.md}'
  app-icon:
    source: 'assets/app-icon.svg'
    foreground: '{colors.brand-primary}'
    background: transparent
    size: 40px
  login-screen:
    background: '{colors.brand-dark}'
    background-photo-opacity: 0.65
    background-photo-height: 380px
    gradient: 'linear, top {colors.brand-dark} at 25% alpha fading to solid {colors.brand-dark} by 50% down'
    title-foreground: '{colors.text-inverse}'
    subtitle-foreground: '{colors.text-dark-secondary}'
    field-label-foreground: '{colors.text-dark-secondary}'
  login-error-note:
    background: '{colors.error-bg-dark}'
    foreground: '{colors.error-dark}'
    radius: '{rounded.md}'
  loading-screen:
    background: '{colors.bg-page}'
    icon-chip-background: '{colors.brand-primary-light}'
    icon-chip-size: 80px
    icon-size: 40px
    pulse-ring-color: '{colors.brand-primary}'
    label-foreground: '{colors.text-secondary}'
---

## Brand & Style

TeamPulse inherits the organization's shared design-token system rather than inventing its own — the same brand language used across the org's product surfaces. That language: **Clean + Intelligent + Trustworthy + Enterprise + Human**. Concretely, this means white space, restrained dark typography for structure, a single indigo-purple accent used sparingly for action and selection, simple neutral surfaces, and rounded-but-not-playful shapes. It explicitly avoids the "AI product" clichés — no neon gradients, no glowing purple blobs, no futuristic grids, no glassmorphism — because the underlying posture (per the brief) is operational: employees submit an idea and get an honest, visible answer, not a flashy experience.

The colors, type ramp, spacing, radii, shadows, and component tokens below are the literal values from that system, not TeamPulse-specific choices.

`[ASSUMPTION]` The provided token set is a marketing-site system (it includes hero-scale typography and 120px section gaps meant for long-form landing pages). Where a token has no direct application-density equivalent, this spine picks the closest app-appropriate token and says so explicitly, rather than importing marketing-scale values into a compact list UI.

## App Icon

TeamPulse's brand mark is a pulse/heartbeat glyph — two overlapping vector paths forming a rounded shape with a waveform cut through it. Source: [`assets/app-icon.svg`](assets/app-icon.svg) (original artwork, viewBox `0 0 24 24`), reproduced as the `AppIcon` reusable component in [`design/ux-design.pen`](../../../../design/ux-design.pen).

- **Color** — rendered in `{colors.brand-primary}`, not the source file's literal fill. `[ASSUMPTION]` this is the one deliberate exception to the "brand purple only for CTA/focus/selection" rule below: a brand mark identifies the product itself, so it carries the identity color regardless of the in-app action-color restriction.
- **Usage in-app** — placed directly above the "TeamPulse" title on both Login states (default and error), at 40×40px with 12px gap to the title, as the product's only branding surface. Not used on the Ideas list or detail screens — those are treated as "inside the app already," where the wordmark alone (`Ideas` page title) is enough.
- **Usage as the application/browser icon** — this glyph is also the source for the app's favicon and PWA/home-screen icon assets (replacing the default Next.js favicon). Implementation should generate the standard icon sizes from `assets/app-icon.svg` at build time rather than hand-recreating the shape.

## Login Screen (dark treatment)

`[ASSUMPTION]` Login is the one screen in TeamPulse that departs from the flat, all-white restraint described elsewhere in this document. It is the product's single unauthenticated, "first impression" surface, so it carries a deliberate dark, editorial treatment to feel distinct and considered — every other screen (Ideas list, idea detail, Add Idea overlay) stays on the light, flat, restrained system exactly as specified. This is a scoped exception, not a new direction for the app.

- **Background** — full-bleed `{colors.brand-dark}` (`#111318`), not white. A photo (people collaborating, `background-photo-opacity: 0.65`) fills the top `380px` behind the header — visible enough to read as real photography and carry the "Human" brand pillar, not just a texture. A linear gradient (`login-screen.gradient` token) sits over the photo, light at the top (`{colors.brand-dark}` at ~25% alpha, so the photo reads clearly behind the app icon/title) and fading to fully solid `{colors.brand-dark}` by ~50% down — this keeps the form legible without flattening the photo into invisibility.
- **Status bar** — the shared `StatusBar` component's default light styling is overridden per-instance on Login only: background `{colors.brand-dark}`, time/signal/wifi/battery icons `{colors.text-inverse}`. Every other screen keeps the component's default light StatusBar untouched.
- **Typography on dark** — `Title` ("TeamPulse") switches to `{colors.text-inverse}`; `Subtitle` and both field labels (`Username`, `Password`) switch to `{colors.text-dark-secondary}` — the org's near-black/grey pairing inverted for a dark surface, not a new color relationship.
- **Inputs stay light** — the `InputField` component itself is *not* restyled globally (it's shared with the Add Idea overlay, which stays light). On Login only, the white input boxes are left as-is against the dark background: this deliberate light-on-dark contrast is what makes the form the clear, unmissable focal point of an otherwise dark screen, echoing the "one obvious next action" pattern used elsewhere (e.g. the Add Idea FAB).
- **Error state** — the `Login - Error` screen's `ErrorNote` swaps from the light `{colors.error-bg}`/`{colors.error}` pairing to `{colors.error-bg-dark}`/`{colors.error-dark}` (a dark maroon card with a lighter coral foreground) — same message, same position, just legible on the dark surface. Nothing else about the error screen changes.
- **Implementation note** — the background photo is a placeholder stock image chosen for composition/mood (warm, in-focus collaboration, not posed/stocky). Before build, swap it for a real or approved team photo, or replace with an abstract/brand pattern if no photo is approved for use — the opacity/gradient treatment should carry over either way.

## Loading Screen

A dedicated branded loading/splash state, distinct from the in-list "cold load" skeleton state (`EXPERIENCE.md.State Patterns`) — see `EXPERIENCE.md.Motion & Loading` for exactly when each one appears and how the animation behaves; this section is the static composition only.

- **Layout** — `StatusBar`, then a vertically-and-horizontally centered `Content` block filling the rest of the screen: the pulsing icon mark, then a `LoadingLabel` text ("Loading TeamPulse…") in `{colors.text-secondary}` beneath it.
- **Icon mark** — the `AppIcon` component (same glyph, same `{colors.brand-primary}`, 40×40) sits on an 80×80 circular "chip" in `{colors.brand-primary-light}` — the same soft-purple "selected/highlighted" pairing used for the upvote control's active state, reused here rather than inventing a new light-purple relationship. Behind the chip, concentric pulse rings (`{colors.brand-primary}`) expand outward and fade, referencing the product's own pulse/heartbeat motif rather than a generic spinner. A live, animated reference for the ring motion lives in the `Loading` frame of [`design/ux-design.pen`](../../../../design/ux-design.pen) (shader-driven — plays in the pen.dev canvas; a static screenshot only ever catches one frame of it).
- **Background** — flat `{colors.bg-page}`, matching the rest of the app (not the Login dark treatment) — loading is a transitional state that can occur at multiple points, not a first-impression brand moment, so it stays on the restrained light system.

## Colors

- **Brand Purple (`{colors.brand-primary}` / hover `{colors.brand-primary-hover}`)** — the one CTA/active/important color, per the org's stated color hierarchy. Used only for: the persistent Add Idea action, form focus states, and the input focus ring. Never used decoratively.
- **Soft Purple (`{colors.brand-primary-light}` / `{colors.brand-primary-subtle}`)** — "selected / highlighted" per the org's hierarchy. Used exclusively for the upvote control's active (already-upvoted) state — the one thing in the UI that represents "you did this."
- **Near-black text (`{colors.text-primary}`, `{colors.brand-dark}`)** — headings and high-emphasis content (idea titles, page titles). `{colors.text-secondary}` and `{colors.text-muted}` carry supporting information (descriptions, metadata, counts) — the org's stated "Neutral Grey → supporting information" role.
- **Status colors** — mapped from the org's semantic status tokens onto TeamPulse's four fixed pipeline stages: `New` uses the neutral surface (`{colors.bg-muted}` / `{colors.text-secondary}`, nothing has happened yet, so nothing is colored); `Under Review` uses `{colors.warning}` (something is in motion); `Planned` uses `{colors.info}` (committed, but not yet delivered); `Done` uses `{colors.success}` ("successful automation/validated result" per the org's hierarchy — here, a shipped idea). `[ASSUMPTION]` this mapping of pipeline stage → token is TeamPulse's own interpretation; the token system defines the four semantic colors but not this specific pipeline.
- **Error (`{colors.error}` / `{colors.error-bg}`)** — form and auth failures only (login, submit, status-change failures).

Avoid: solid saturated fills on status badges (use the tinted `-bg` pairs, not flat color blocks — this is what keeps the badge system "restrained" rather than "traffic light"); brand purple anywhere except action/selection; any color not defined in the token set.

## Typography

Single family: **Inter** (`{typography.font-primary}`), replacing the Geist Sans placeholder from the prior draft — `layout.tsx` will need its font import updated when this is built. Roles, mapped from the org's type scale onto app-appropriate (not marketing-hero) sizes: `display` (page title, e.g. "Ideas") at 32px/600 — the org's `h3` size, since TeamPulse has no landing-page hero; `heading` (idea title) at 20px/600; `body` (description text) at 16px/400, line-height 1.6 for comfortable reading; `label` (form labels, badge text) at 14px/500; `caption` (metadata: upvote count, date) at 12px/400.

`[ASSUMPTION]` The org's `clamp()`-based hero/section headings (`--font-size-h1`/`h2`, up to 64px) are marketing-only and not used anywhere in TeamPulse — there is no hero surface in this application.

## Layout & Spacing

The org's 4px spacing scale, unchanged. `content-max-width: {spacing.content-max-width}` (768px, the org's `container-sm`) — wide enough for comfortable reading, still a single reading column, not a wide-table layout. Page gutters follow the org's responsive padding tokens: `{spacing.page-padding-mobile}` (20px) on phones, `{spacing.page-padding-tablet}` (32px) on tablets, `{spacing.page-padding-desktop}` (48px) on desktop. `{spacing.content-gap}` (32px) separates major blocks (e.g., page header from the idea list); idea cards within the list sit closer together, at `{spacing.4}` (16px), since list density matters more there than the org's default card rhythm.

Single-column layout at every width — TeamPulse is mobile-first per the brief, and the org's own layout principle ("a lot of whitespace, clearly separated sections") reads as generous single-column spacing here, not a multi-column desktop expansion.

## Elevation & Depth

Mostly flat: idea cards use a hairline border (`{colors.border-light}`), not a shadow — consistent with the org's restrained, enterprise posture. Shadows are reserved for genuinely floating elements: the persistent Add Idea action carries `shadow-xs` (`0 1px 2px rgba(16, 18, 24, 0.05)` → tightened here to a barely-there `0 4px 12px rgba(16, 18, 24, 0.06)` per the `add-idea-fab` token, so it still reads as "floating and tappable" without a heavy drop shadow) and the Add Idea overlay itself carries `shadow-md` (`0 12px 32px rgba(16, 18, 24, 0.08)`) to separate it clearly from the page behind it.

## Shapes

`{rounded.md}` (10px) is the default corner for buttons, inputs, and the Add Idea overlay — rounded but not playful, per the org's direction. `{rounded.lg}` (16px) is used for idea cards, matching the org's `card-radius` token exactly. `{rounded.full}` (pill) is reserved for status badges and the upvote control — both are state indicators, not actions, and the pill shape signals that distinction consistently.

## Components

→ Composition reference: [`design/ux-design.pen`](../../../../design/ux-design.pen) (live, maintained — use this for implementation) — organized by navigation flow, with reusable components (StatusBar, StatusBadge, UpvoteControl, IdeaCard, PrimaryButton, InputField, AddIdeaFab, AppIcon) and all screen states, including the `Loading` splash screen. The static [`mockups/idea-list.html`](mockups/idea-list.html), [`mockups/idea-detail.html`](mockups/idea-detail.html), [`mockups/add-idea-overlay.html`](mockups/add-idea-overlay.html), [`mockups/login.html`](mockups/login.html) are a frozen snapshot from Finalize — do not build against them if they've drifted from the `.pen` file. Spine wins on conflict with either.

- **Idea card** — `{colors.bg-page}` background, `{colors.border-light}` hairline border, `{rounded.lg}`, `{spacing.4}` internal padding (tighter than the org's default 32px `card-padding`, deliberately — see Layout & Spacing). Contains title (`heading`), status badge, upvote control.
- **Status badge** (4 variants) — pill, **tinted** background + colored text (not solid fill): `bg-muted`/`text-secondary` (New), `warning-bg`/`warning` (Under Review), `info-bg`/`info` (Planned), `success-bg`/`success` (Done). Same rendering wherever it appears (list card, detail view).
- **Upvote control** — pill toggle. Inactive: `{colors.bg-muted}` / `{colors.text-secondary}`. Active (already upvoted): `{colors.brand-primary-light}` / `{colors.brand-primary}` — the org's "soft purple = selected" role, applied literally. No un-upvote, so the active state is permanent once set.
- **Add Idea action** — floating pill, `{colors.brand-primary}` fill, `{colors.text-inverse}` label, `add-idea-fab` shadow token. Reachable from anywhere per FR-1.
- **Add Idea overlay** — `{colors.bg-page}`, `{rounded.lg}`, `add-idea-overlay` shadow. Inputs use the `input` component token: 48px height, `{colors.border-default}` border, `{colors.brand-primary}` focus border + `{components.focus-ring}` ring.
- **Admin status control** (`admin-status-control` token) — plain segmented/select control; current stage filled `{colors.brand-primary}` / `{colors.text-inverse}`, other stages `{colors.bg-page}` with `{colors.border-default}`. Rendered only for Admins — absent, not disabled, for Employees (FR-4).
- **Primary button** — `{colors.brand-primary}` fill (hover: `{colors.brand-primary-hover}`), `{colors.text-inverse}` label, `{rounded.md}`, 48px height (`button-height-md` from the org's scale — TeamPulse has no need for the `sm`/`lg` variants at this point).

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use `{colors.brand-primary}` only for the Add Idea action, focus states, active-selection color, and the App Icon brand mark | Use brand purple decoratively, or introduce a second accent color |
| Render status badges as tinted background + colored text | Render status badges as solid saturated fills ("traffic light" look) |
| Keep idea cards flat with a hairline border | Add drop shadows to cards to convey hierarchy |
| Single-column layout with generous, org-consistent spacing at every width | Introduce a multi-column desktop layout or dense data table |
| Inter, at the app-appropriate sizes defined above | Use the org's marketing hero sizes (`h1`/`h2`, `clamp()` headings) anywhere in this app |
| Keep the Login dark/photo treatment scoped to Login only (see [Login Screen (dark treatment)](#login-screen-dark-treatment)) | Carry the dark background, photo, or `-dark` color tokens onto any other screen |
