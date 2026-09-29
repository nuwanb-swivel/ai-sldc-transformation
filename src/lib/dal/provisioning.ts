import { eq } from "drizzle-orm";

import { client, db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export type Role = "employee" | "admin";

/**
 * Sets a user's `role` directly (bypassing Better Auth's `input: false`
 * guard on that field -- AD-8). The only caller is `scripts/seed-user.ts`,
 * which cannot import `lib/db` itself (AD-2's import boundary is enforced
 * for the whole `src/**` tree, including this provisioning script).
 */
export async function setUserRole(username: string, role: Role) {
  await db
    .update(user)
    .set({ role })
    .where(eq(user.username, username.toLowerCase()));
}

/** Closes the shared DB connection -- lets `scripts/seed-user.ts` exit
 * cleanly without importing `lib/db` itself. */
export async function closeDbConnection() {
  await client.end();
}
