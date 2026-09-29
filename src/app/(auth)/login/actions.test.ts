import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/db";

import { login } from "./actions";

// `login` calls `next/headers`'s `headers()` (request-scoped, unavailable
// under Vitest) and, on success, `next/navigation`'s `redirect()` (which
// throws to halt rendering in a real request) -- mocked here the same way as
// `src/lib/dal/session.test.ts`, against a real Postgres-backed user (AD-9).
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mocked(headers).mockResolvedValue(
  new Headers() as unknown as Awaited<ReturnType<typeof headers>>,
);

afterEach(async () => {
  vi.clearAllMocks();
  await db.execute(sql`truncate table "user" cascade`);
});

afterAll(() => client.end());

async function seedUser(username: string, password: string) {
  await auth.api.signUpEmail({
    body: {
      name: username,
      email: `${username}@teampulse.local`,
      password,
      username,
    },
  });
}

function formDataOf(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe("login", () => {
  it("redirects into the app shell on correct credentials (NFR-5 shape not asserted -- redirect throws before returning)", async () => {
    await seedUser("jane.doe", "correct-horse-battery");

    await login(
      null,
      formDataOf({ username: "jane.doe", password: "correct-horse-battery" }),
    );

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it('returns { ok: false, error: "Incorrect username or password." } for a wrong password, without redirecting', async () => {
    await seedUser("jane.doe", "correct-horse-battery");

    const result = await login(
      null,
      formDataOf({ username: "jane.doe", password: "wrong-password" }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Incorrect username or password.",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns the same fixed error for an unknown username", async () => {
    const result = await login(
      null,
      formDataOf({ username: "nobody", password: "whatever-password" }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Incorrect username or password.",
    });
  });

  it("returns the same fixed error when a field is missing, never a raw exception", async () => {
    const result = await login(null, formDataOf({ username: "jane.doe" }));

    expect(result).toEqual({
      ok: false,
      error: "Incorrect username or password.",
    });
  });
});
