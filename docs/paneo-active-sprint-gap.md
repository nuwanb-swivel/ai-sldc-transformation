# Why the Paneo board doesn't show an active sprint

## The gap

Paneo's dashboard only groups stories into sprint columns/cards when
`sprint-status.yaml` has a `sprints:` block (the "nested" schema: each sprint
has `number`, `start`, `end`, `goal`, `status`, and a `stories` map).

BMAD's `sprint-planning` skill does not write that block. It writes the flat
`development_status` schema instead — a plain epic/story key → status map,
with no sprint number, dates, or goal attached to any story.

Paneo still reads flat `development_status` files (it's one of the two
schemas it recognizes), but without a `sprints:` block every story falls back
to `sprintId: "backlog"`. There's nothing for the board to render as the
active sprint, so it all shows up under Backlog instead.

This is confirmed directly in Paneo's own config schema
(`node_modules/@swiveltech/paneo/schema.json`, `paths.sprintPlan`):

> "Paneo has no structured sprint-assignment source yet."

## The fix

Add a `sprints:` block to `_bmad-output/implementation-artifacts/sprint-status.yaml`
alongside the existing `development_status` block:

```yaml
sprints:
  sprint-1:
    number: 1
    start: "2026-09-15"
    end: "2026-09-29"
    goal: "Ship project/data test foundation and employee authentication for Epic 1"
    status: active          # planned | active | done
    stories:
      1-1-project-data-test-foundation: done
      1-2-employee-authenticates-and-reaches-the-app: backlog
```

Notes:
- Story keys under `stories:` must match the keys used in `development_status`.
- Any story left out of every `sprints:` entry (and out of `backlog:`, if you
  use that too) is picked up from `development_status` and placed in Backlog.
- `status: active` is what makes Paneo treat this as *the* current sprint.

## Why this isn't a permanent fix

This block is **not** written by BMAD's `sprint-planning` skill — it only
maintains the flat `development_status` map. Every time `sprint-planning`
regenerates `sprint-status.yaml`, the hand-added `sprints:` block will be
lost unless it's re-added.

Until BMAD's sprint-planning skill (or Paneo itself) grows a real
sprint-assignment source, treat the `sprints:` block as a manual bridge:
re-apply it after each sprint-planning run, or wire an automation step that
re-injects it before starting the Paneo dashboard.
