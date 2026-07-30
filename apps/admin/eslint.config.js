import { nextJsConfig } from "@repo/eslint-config/next-js";

/**
 * Underscore-prefixed parameters are deliberate interface placeholders.
 * All other unused variables remain reportable and fail the CI lint ratchet.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
    ...nextJsConfig,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
];
