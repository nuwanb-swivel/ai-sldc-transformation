import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    // Integration tests share one real, disposable Postgres instance (AD-9)
    // and truncate the tables they touch between tests -- run test files
    // sequentially so one file's truncation can't race another file's
    // fixture setup.
    fileParallelism: false,
  },
});
