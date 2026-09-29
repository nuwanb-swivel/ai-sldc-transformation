import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

// This is the only module besides `lib/dal/**` allowed to import `lib/db`
// (enforced by the `no-restricted-imports` ESLint rule) -- it owns Better
// Auth's own Drizzle-adapter wiring.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  // Credentials provider (ARCHITECTURE-SPINE.md Stack) -- no self-registration
  // UI is ever built on top of it; `scripts/seed-user.ts` is the only caller
  // of the sign-up endpoint this enables.
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), nextCookies()],
  secret: env.BETTER_AUTH_SECRET,
  // Keep ids as UUID v4 across every table (including Better Auth's own),
  // matching the architecture spine's "Primary keys: UUID v4" convention.
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["employee", "admin"],
        input: false,
        defaultValue: "employee",
      },
    },
  },
});
