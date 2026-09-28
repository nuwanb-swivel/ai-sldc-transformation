import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["employee", "admin"]);

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username").notNull().unique(),
  role: role("role").notNull().default("employee"),
});
