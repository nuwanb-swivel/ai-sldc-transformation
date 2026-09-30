import { convertSetCookieToCookie } from "better-auth/test";
import { sql } from "drizzle-orm";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/db";

import { createIdea } from "./ideas";
import { getSession } from "./session";

// `createIdea` takes a resolved session (not `next/headers`), so this test
// builds a real one via `getSession` the same way `session.test.ts` does,
// against a real Postgres-backed user (AD-9) -- no `next/headers` mocking
// needed since `getSession` already takes an explicit `Headers`.
afterEach(async () => {
  await db.execute(sql`truncate table "user" cascade`);
});

afterAll(() => client.end());

async function signUpAndGetSession(username: string, password: string) {
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

  const cookieHeaders = convertSetCookieToCookie(responseHeaders);
  const session = await getSession(cookieHeaders);

  if (!session) {
    throw new Error("expected a session after sign-in");
  }

  return session;
}

describe("createIdea", () => {
  it("creates a row with status=new, submitter=caller, and a timestamp (happy path)", async () => {
    const session = await signUpAndGetSession(
      "priya.n",
      "correct-horse-battery",
    );

    const row = await createIdea(
      { title: "Coffee machine rota", description: "It keeps breaking." },
      session,
    );

    expect(row).toMatchObject({
      title: "Coffee machine rota",
      description: "It keeps breaking.",
      status: "new",
      submitterId: session.user.id,
    });
    expect(row.createdAt).toBeInstanceOf(Date);
  });

  it("rejects an empty title without writing a row", async () => {
    const session = await signUpAndGetSession(
      "priya.n",
      "correct-horse-battery",
    );

    await expect(
      createIdea({ title: "", description: "Valid description." }, session),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it("rejects an empty description without writing a row", async () => {
    const session = await signUpAndGetSession(
      "priya.n",
      "correct-horse-battery",
    );

    await expect(
      createIdea({ title: "Valid title", description: "" }, session),
    ).rejects.toBeInstanceOf(ZodError);
  });
});
