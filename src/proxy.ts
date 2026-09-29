import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic-only redirect (AD-7): reads the session cookie and redirects
// unauthenticated requests to `/login`. Never queries the database or makes
// a role decision -- `requireSession()`/`requireAdmin()` in the DAL remain
// the authoritative check, independent of this proxy.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Each excluded literal is boundary-anchored (`(?:/|$)`) so it only
    // matches that exact leading path segment -- e.g. `login` excludes
    // `/login` and `/login/...` but not `/login-history`; `api/auth`
    // excludes `/api/auth` and `/api/auth/...` but not `/api/authorize`.
    // The trailing `.*\\.[^/]+$` excludes any request for a public static
    // asset generally (favicon.ico, robots.txt, sitemap.xml, and any future
    // one) rather than enumerating specific filenames.
    "/((?!login(?:/|$)|api/auth(?:/|$)|_next/static(?:/|$)|_next/image(?:/|$)|.*\\.[^/]+$).*)",
  ],
};
