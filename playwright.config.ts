import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Enables `src/app/e2e-diagnostics/loading-check` only for the server
    // this config starts -- a real `next start` (production) never sets
    // this, so that route 404s there (see that page's comment).
    env: { ...process.env, E2E_DIAGNOSTICS: "1" },
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
