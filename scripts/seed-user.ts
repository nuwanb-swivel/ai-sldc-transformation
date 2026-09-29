#!/usr/bin/env -S npx tsx
// Admin-provisioning CLI (AD-8): accounts are Admin-provisioned only -- no
// self-registration UI exists. Creates a user via Better Auth's own
// sign-up path, then a direct DB update sets `role` (which is `input: false`
// in `lib/auth/index.ts` and therefore cannot be set through that path).
//
// Usage:
//   npm run db:seed -- --username jane.doe --password correcthorsebatterystaple --role employee
import { loadEnvConfig } from "@next/env";

type Role = "employee" | "admin";

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    i += 1;
  }

  return args;
}

function isRole(value: string): value is Role {
  return value === "employee" || value === "admin";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { username, password } = args;
  const role = args.role ?? "employee";

  if (!username || !password) {
    console.error(
      "Usage: npm run db:seed -- --username <username> --password <password> [--role employee|admin]",
    );
    process.exitCode = 1;
    return;
  }

  if (!isRole(role)) {
    console.error(`Invalid --role "${role}" -- must be "employee" or "admin".`);
    process.exitCode = 1;
    return;
  }

  // Loaded before any module that reads `process.env` (mirrors
  // `drizzle.config.ts`), so `.env.local` is picked up the same way `next
  // dev`/`next build` would load it. The dynamic imports below (rather than
  // static top-level ones) are what make that ordering possible.
  loadEnvConfig(process.cwd());

  // Neither of these touches `lib/db` directly -- `@/lib/auth` is the one
  // module besides `lib/dal/**` allowed to (AD-2), and `setUserRole`/
  // `closeDbConnection` are `lib/dal` functions, so this script satisfies
  // the same import boundary as the rest of `src/**`.
  const { auth } = await import("@/lib/auth");
  const { setUserRole, closeDbConnection } = await import(
    "@/lib/dal/provisioning"
  );

  try {
    // Better Auth's core requires `name`/`email` even with the `username`
    // plugin active; both are internal, server-synthesized fields the app
    // never surfaces (see `lib/db/schema.ts`).
    await auth.api.signUpEmail({
      body: {
        name: username,
        email: `${username}@teampulse.local`,
        password,
        username,
      },
    });

    await setUserRole(username, role);

    console.log(`Created user "${username}" with role "${role}".`);
  } finally {
    await closeDbConnection();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
