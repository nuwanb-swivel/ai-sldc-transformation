import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["employee", "admin"]);

export const ideaStatus = pgEnum("idea_status", [
  "new",
  "under_review",
  "planned",
  "done",
]);

// `user` is extended for Better Auth (credentials + `username` plugin),
// generated via `npx @better-auth/cli generate` against `src/lib/auth/index.ts`
// and hand-merged to keep `id` a UUID v4 (see `advanced.database.generateId`
// in that config) and `role` unchanged from Story 1.1.
//
// `email`/`name` are required by Better Auth's core even with the `username`
// plugin, but the app never surfaces them in UI/API: `email` is synthesized
// as `${username}@teampulse.local` and `name` mirrors `username` at account
// creation (see `scripts/seed-user.ts`). This is a deliberate deviation from
// the ER diagram in `ARCHITECTURE-SPINE.md`, which only models `id`/`username`/
// `role` -- see spec Design Notes.
export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username").notNull().unique(),
  displayUsername: varchar("display_username"),
  role: role("role").notNull().default("employee"),
  // `default("")` only matters for a migration applying against a `user`
  // table that already has rows (the columns are always populated at
  // account-creation time in practice; see the comment above) -- without
  // it, `NOT NULL` with no default fails outright on any non-empty table.
  name: text("name").notNull().default(""),
  email: text("email").notNull().unique().default(""),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Story 2.1: Submit an Idea. `upvote_count` is deliberately not a column
// here -- Epic 2 context specifies it's always derived via `COUNT` against
// the (future) `upvotes` join table, never a directly-incremented column.
export const idea = pgTable(
  "idea",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: ideaStatus("status").notNull().default("new"),
    submitterId: uuid("submitter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idea_submitter_id_idx").on(table.submitterId)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ideas: many(idea),
}));

export const ideaRelations = relations(idea, ({ one }) => ({
  submitter: one(user, {
    fields: [idea.submitterId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
