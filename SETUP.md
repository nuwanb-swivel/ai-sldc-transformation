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

# 4. Install dependencies
npm install

# 5. Apply migrations (once Drizzle is added to the project)
npm run db:migrate

# 6. Run the app
npm run dev                 # http://localhost:3000

# 7. Run tests against the real container (once Vitest is added)
npm run test:integration
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
- `npm run db:migrate` / `npm run test:integration`: **TODO** — Drizzle and Vitest are not yet installed in this repo (tracked in `AGENTS.md`'s Definition of Done). Once added, wire these as npm scripts; CI (`.github/workflows/ci.yml`) already has the corresponding steps stubbed in and commented out.
- CI uses the identical `postgres:18` image and port mapping as local, via a GitHub Actions `services:` container — no separate hosted test database (AD-9).
