import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    files: ["src/seed.ts"],
    rules: {
      // Seed fixtures contain heterogeneous Drizzle insert payloads. DB-01 owns
      // replacing the remaining assertion with typed fixture builders.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
