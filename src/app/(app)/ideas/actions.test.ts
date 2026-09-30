import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/db";
import * as ideasDal from "@/lib/dal/ideas";

import { submitIdea } from "./actions";

// Same mocking approach as `src/app/(auth)/login/actions.test.ts` and
// `src/lib/dal/session.test.ts`: `next/headers`/`next/navigation` are mocked
// (request-scoped/throwing primitives unavailable under Vitest), while the
// DB stays real (AD-9) except in the one test below that needs to force a
// write failure that a real Postgres won't reproduce on demand.
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    // Mirrors Next.js's real `redirect()`, which throws to halt rendering --
    // needed here so `requireSession()` never returns to `submitIdea`,
    // proving the DAL write is never reached for an unauthenticated caller.
    throw new Error("NEXT_REDIRECT");
  }),
}));

afterEach(async () => {
  vi.clearAllMocks();
  await db.execute(sql`truncate table "user" cascade`);
});

afterAll(() => client.end());

async function signUpAndAuthHeaders(username: string, password: string) {
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

  const { convertSetCookieToCookie } = await import("better-auth/test");
  return convertSetCookieToCookie(responseHeaders);
}

function formDataOf(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe("submitIdea", () => {
  it("returns the fixed error and logs the real cause when the DAL write throws", async () => {
    const cookieHeaders = await signUpAndAuthHeaders(
      "priya.n",
      "correct-horse-battery",
    );
    vi.mocked(headers).mockResolvedValue(
      cookieHeaders as unknown as Awaited<ReturnType<typeof headers>>,
    );
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const dbFailure = new Error("connection reset");
    vi.spyOn(ideasDal, "createIdea").mockRejectedValueOnce(dbFailure);

    const result = await submitIdea(
      null,
      formDataOf({
        title: "Coffee machine rota",
        description: "It keeps breaking.",
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Couldn't submit. Check your connection and try again.",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[submitIdea] create failed",
      dbFailure,
    );

    consoleErrorSpy.mockRestore();
  });

  it("rejects an unauthenticated caller before any DAL write runs", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers() as unknown as Awaited<ReturnType<typeof headers>>,
    );
    const createIdeaSpy = vi.spyOn(ideasDal, "createIdea");

    await expect(
      submitIdea(
        null,
        formDataOf({ title: "An idea", description: "A description." }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(createIdeaSpy).not.toHaveBeenCalled();
  });
});
