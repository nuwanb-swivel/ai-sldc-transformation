# Local setup

Brings up a real, disposable Postgres and a runnable dev environment — the same database CI uses (see `ARCHITECTURE-SPINE.md`, AD-9). No mocks, no in-memory DB substitutes.

## Prerequisites

- Node.js 22, npm
- Docker + Docker Compose

## Steps

```bash
# 1. Start Postgres (host port 1999 -> container 5432)
docker compose up -d

# 2. Wait for it to be healthy
docker compose ps          # STATUS should show "healthy"

# 3. Configure environment
cp .env.example .env.local
# then edit .env.local and set a real BETTER_AUTH_SECRET

# 4. Install dependencies
npm install

# 5. Apply migrations
npm run db:migrate

# 6. Run the app
npm run dev                 # http://localhost:3000

# 7. Run tests against the real container
npm run test:integration

# 8. Run the Playwright placeholder e2e spec
npm run test:e2e
```

## Verifying the database directly

```bash
docker compose exec postgres psql -U teampulse -d teampulse -c '\dt'
```

## Tearing down

```bash
docker compose down          # stop, keep data volume
docker compose down -v       # stop and wipe the data volume
```

## Status

- Postgres container, port 1999, migrations-ready volume path: **done** (`docker-compose.yml`).
- `npm run db:migrate` / `npm run test:integration`: **done** — Drizzle (`drizzle-orm`/`drizzle-kit`) and Vitest are installed and wired; the first migration (`drizzle/migrations/0000_amazing_praxagora.sql`) creates the `user` table, and `src/lib/db/index.integration.test.ts` proves the Postgres+Drizzle harness end-to-end.
- `npm run test:e2e`: **done** — Playwright is installed and wired; `e2e/placeholder.spec.ts` builds/starts the app and asserts the default Next.js scaffold renders, proving the harness (real feature e2e coverage lands in later stories).
- CI (`.github/workflows/ci.yml`) runs install → lint → typecheck/build → migrate → integration tests → e2e in order, failing fast at the first red stage.
- CI uses the identical `postgres:18` image and port mapping as local, via a GitHub Actions `services:` container — no separate hosted test database (AD-9).
