import { config } from "@repo/eslint-config/base";

/**
 * The exceptions below are deliberately narrow and file-scoped.
 *
 * - OTA adapters are explicit placeholders until provider certification is available.
 * - Notification typing and the two orchestration variables are existing legacy debt.
 *
 * New files and all unrelated rules remain strict. Remove these exceptions in OTA-01,
 * API-01 and OBS-01 rather than increasing a global warning threshold.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
    ...config,
    {
        files: [
            "src/channel-manager/adapters/booking-com.ts",
            "src/channel-manager/adapters/expedia.ts",
            "src/channel-manager/adapters/gozayaan.ts",
            "src/channel-manager/adapters/sharetrip.ts",
        ],
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
    {
        files: ["src/channel-manager/index.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^(ExternalBooking|startTime)$",
                },
            ],
        },
    },
    {
        files: ["src/notifications/index.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^users$",
                },
            ],
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    {
        files: ["src/pricing/index.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^(hotelOccupancy|seasonalRules)$",
                },
            ],
        },
    },
];
