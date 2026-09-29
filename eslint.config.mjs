import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // `lib/db` is importable only from `lib/dal/**` or `lib/auth/index.ts`
  // (Better Auth's own Drizzle-adapter wiring) -- AD-2. Everything else in
  // `src/**` (Server Actions, Server/Client Components) must go through the
  // DAL.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/lib/dal/**",
      "src/lib/auth/index.ts",
      // Integration tests truncate the tables they touch between runs
      // (ARCHITECTURE-SPINE.md Testing convention, AD-9) and so need direct
      // DB access regardless of which layer they exercise.
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/db", "@/lib/db/*", "**/lib/db", "**/lib/db/*"],
              message:
                "`lib/db` may only be imported from `lib/dal/**` or `lib/auth/index.ts` (AD-2).",
            },
          ],
        },
      ],
      // `no-restricted-imports` only inspects static `import`/`export`
      // declarations -- it does not see a dynamic `import("@/lib/db")`
      // expression, which is otherwise an unchecked way around AD-2's
      // boundary.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportExpression[source.value=/(^|\\/)lib\\/db(\\/|$)/]",
          message:
            "`lib/db` may only be imported from `lib/dal/**` or `lib/auth/index.ts` (AD-2) -- including dynamic `import()`.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
