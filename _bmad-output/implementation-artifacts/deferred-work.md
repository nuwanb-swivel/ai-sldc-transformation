- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-data-test-foundation.md`
  summary: Revisit the integration test's `truncate table "user" cascade` isolation strategy once Story 1.2 adds Better-Auth tables with foreign keys to `user`.
  evidence: The cascade currently only touches `user` (no other tables exist yet), so it's harmless today, but once FK tables land, an unqualified `cascade` truncate on every test run will silently wipe rows in those tables too unless the isolation strategy (truncate-all-touched-tables vs. per-test transactions) is reconsidered.
