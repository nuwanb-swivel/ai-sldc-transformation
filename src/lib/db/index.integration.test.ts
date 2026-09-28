import { eq, sql } from "drizzle-orm";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import { client, db } from "@/lib/db";
import { user } from "@/lib/db/schema";

afterEach(async () => {
  await db.execute(sql`truncate table "user" cascade`);
});

afterAll(() => client.end());

describe("db", () => {
  it("inserts and reads a user row through drizzle", async () => {
    const [inserted] = await db
      .insert(user)
      .values({ username: "jane.doe" })
      .returning();

    expect(inserted.username).toBe("jane.doe");
    expect(inserted.role).toBe("employee");

    const rows = await db
      .select()
      .from(user)
      .where(eq(user.id, inserted.id));

    expect(rows).toHaveLength(1);
    expect(rows[0].username).toBe("jane.doe");
  });
});
