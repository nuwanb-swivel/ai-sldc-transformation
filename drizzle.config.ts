import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

// Loaded via `require` (not a static `import`) so this only evaluates -- and
// therefore only reads `process.env` -- after `loadEnvConfig` above has run.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { env } = require("./src/lib/env") as typeof import("./src/lib/env");

export default defineConfig({
  dialect: "postgresql",
  schema: "src/lib/db/schema.ts",
  out: "drizzle/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
