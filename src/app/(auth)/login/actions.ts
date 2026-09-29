"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// NFR-5: every Server Action returns this discriminated union. `error` is
// always short, display-ready copy from a small fixed set -- never a raw
// exception message.
export type LoginResult = { ok: true; data: null } | { ok: false; error: string };

const INCORRECT_CREDENTIALS_ERROR = "Incorrect username or password.";

export async function login(
  _prevState: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const username = formData.get("username");
  const password = formData.get("password");

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length === 0 ||
    password.length === 0
  ) {
    return { ok: false, error: INCORRECT_CREDENTIALS_ERROR };
  }

  try {
    await auth.api.signInUsername({
      body: { username, password },
      headers: await headers(),
    });
  } catch (error) {
    // The real cause is server-logged only; the client only ever sees the
    // fixed, display-ready copy above (NFR-5).
    console.error("[login] sign-in failed", error);
    return { ok: false, error: INCORRECT_CREDENTIALS_ERROR };
  }

  redirect("/");
}
