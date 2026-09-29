import { convertSetCookieToCookie } from "better-auth/test";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/db";

import { setUserRole } from "./provisioning";
import { getSession, requireAdmin, requireSession } from "./session";

// `requireSession()`/`requireAdmin()` call `next/headers`'s `headers()`
// (request-scoped, unavailable under Vitest) and `next/navigation`'s
// `redirect()`/`forbidden()` (which throw to halt rendering in a real
// request). Mocking these two Next.js framework primitives lets this test
// verify the DAL's own guard wiring (AD-2, AD-7) against a real session
// resolved from a real Postgres-backed sign-in -- never a mocked database
// (AD-9). Full end-to-end redirect/forbidden behavior is covered by
// `e2e/login.spec.ts`.
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(), forbidden: vi.fn() }));

afterEach(async () => {
  vi.clearAllMocks();
  await db.execute(sql`truncate table "user" cascade`);
});

afterAll(() => client.end());

async function signUpAndSignIn(username: string, password: string) {
  await auth.api.signUpEmail({
    body: {
      name: username,
      email: `${username}@teampulse.local`,
      password,
      username,
    },
  });

  const { headers: responseHeaders } = await auth.api.signInUsername({
    body: { username, password },
    returnHeaders: true,
  });

  return convertSetCookieToCookie(responseHeaders);
}

describe("getSession", () => {
  it("returns the session for a request carrying a valid session cookie", async () => {
    const cookieHeaders = await signUpAndSignIn(
      "jane.doe",
      "correct-horse-battery",
    );

    const session = await getSession(cookieHeaders);

    expect(session?.user.username).toBe("jane.doe");
    expect(session?.user.role).toBe("employee");
  });

  it("returns null when no session cookie is present", async () => {
    const session = await getSession(new Headers());

    expect(session).toBeNull();
  });
});

describe("requireSession", () => {
  it("returns the session when one is present", async () => {
    const cookieHeaders = await signUpAndSignIn(
      "priya.n",
      "correct-horse-battery",
    );
    vi.mocked(headers).mockResolvedValue(
      cookieHeaders as unknown as Awaited<ReturnType<typeof headers>>,
    );

    const session = await requireSession();

    expect(session?.user.username).toBe("priya.n");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no valid session -- the authoritative rejection independent of proxy.ts (AD-2, AD-7)", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers() as unknown as Awaited<ReturnType<typeof headers>>,
    );

    await requireSession();

    expect(redirect).toHaveBeenCalledWith("/login");
  });
});

describe("requireAdmin", () => {
  it("calls forbidden() for an authenticated non-Admin", async () => {
    const cookieHeaders = await signUpAndSignIn(
      "marcus.k",
      "correct-horse-battery",
    );
    vi.mocked(headers).mockResolvedValue(
      cookieHeaders as unknown as Awaited<ReturnType<typeof headers>>,
    );

    await requireAdmin();

    expect(forbidden).toHaveBeenCalled();
  });

  it("returns the session without calling forbidden() for an authenticated Admin", async () => {
    const cookieHeaders = await signUpAndSignIn(
      "admin.user",
      "correct-horse-battery",
    );
    await setUserRole("admin.user", "admin");
    vi.mocked(headers).mockResolvedValue(
      cookieHeaders as unknown as Awaited<ReturnType<typeof headers>>,
    );

    const session = await requireAdmin();

    expect(session?.user.role).toBe("admin");
    expect(forbidden).not.toHaveBeenCalled();
  });
});
