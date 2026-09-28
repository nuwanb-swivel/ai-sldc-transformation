import { afterEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  const originalBetterAuthSecret = process.env.BETTER_AUTH_SECRET;

  afterEach(() => {
    process.env.BETTER_AUTH_SECRET = originalBetterAuthSecret;
  });

  it("throws a Zod validation error when BETTER_AUTH_SECRET is missing", async () => {
    delete process.env.BETTER_AUTH_SECRET;
    vi.resetModules();

    await expect(import("@/lib/env")).rejects.toThrow(/BETTER_AUTH_SECRET/);
  });
});
