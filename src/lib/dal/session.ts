import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

/**
 * Reads the current session directly from Better Auth. Takes an explicit
 * `Headers` (rather than calling `headers()` internally) so it's callable
 * from Vitest without a Next.js request context -- a test can build real
 * `Headers` from `auth.api.signInUsername`'s cookie and call this directly
 * (see spec Design Notes). Wrapped in React's `cache()` so the layout and
 * page's separate `requireSession()` calls within one request dedupe to a
 * single lookup.
 */
export const getSession = cache(async (headersList: Headers) => {
  return auth.api.getSession({ headers: headersList });
});

/**
 * The authoritative auth guard (AD-2, AD-7): every Server Action and every
 * Server Component reading protected data calls this. Independent of
 * `proxy.ts` -- a request that somehow bypasses the proxy is still rejected
 * here.
 */
export async function requireSession() {
  const session = await getSession(await headers());

  if (!session) {
    redirect("/login");
  }

  return session;
}

/** `requireSession()` plus a role check; renders `forbidden.tsx` for non-Admins. */
export async function requireAdmin() {
  const session = await requireSession();

  if (session.user.role !== "admin") {
    forbidden();
  }

  return session;
}
