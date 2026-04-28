import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const BANNED_PATHS = [
  "@/lib/api-utils",
  "@/lib/api-schemas",
  "@/lib/require-admin",
  "@/lib/prisma",
  "@/auth",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: BANNED_PATHS.map((name) => ({
            name,
            message:
              "This path was removed. Use the structured equivalents under @/lib/api/, @/lib/auth/, @/lib/schemas/, or @/lib/db instead.",
          })),
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
    "docs/GGE-Dashboard prototype/**",
  ]),
]);

export default eslintConfig;
