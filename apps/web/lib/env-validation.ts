"use server";

/**
 * Environment validation utility for production readiness
 * This ensures all required environment variables are set before the app runs
 */

interface EnvConfig {
    name: string;
    required: boolean;
    productionOnly?: boolean;
}

const ENV_CONFIGS: EnvConfig[] = [
    // Database
    { name: "DATABASE_URL", required: true },

    // Authentication
    { name: "AUTH_SECRET", required: true },
    { name: "AUTH_GOOGLE_ID", required: true },
    { name: "AUTH_GOOGLE_SECRET", required: true },

    // Cron jobs (production only)
    { name: "CRON_SECRET", required: true, productionOnly: true },

    // Error tracking (production only)
    { name: "SENTRY_DSN", required: false, productionOnly: true },

    // Payment
    { name: "BKASH_API_URL", required: false },
    { name: "BKASH_APP_KEY", required: false },
    { name: "BKASH_APP_SECRET", required: false },
    { name: "BKASH_USERNAME", required: false },
    { name: "BKASH_PASSWORD", required: false },

    // Storage
    { name: "BLOB_READ_WRITE_TOKEN", required: false },
];

export interface ValidationResult {
    valid: boolean;
    missing: string[];
    warnings: string[];
}

/**
 * Validates that all required environment variables are set
 * Call this at application startup
 */
export async function validateEnv(): Promise<ValidationResult> {
    const isProduction = process.env.NODE_ENV === "production";
    const missing: string[] = [];
    const warnings: string[] = [];

    for (const config of ENV_CONFIGS) {
        const value = process.env[config.name];

        // Skip production-only checks in development
        if (config.productionOnly && !isProduction) {
            if (!value) {
                warnings.push(`${config.name} is not set (required in production)`);
            }
            continue;
        }

        if (config.required && !value) {
            missing.push(config.name);
        } else if (!config.required && !value) {
            warnings.push(`${config.name} is not set (optional)`);
        }
    }

    return {
        valid: missing.length === 0,
        missing,
        warnings,
    };
}

/**
 * Throws an error if any required environment variables are missing
 * Use this for strict validation at startup
 */
export async function requireEnv(): Promise<void> {
    const result = await validateEnv();

    if (!result.valid) {
        const errorMessage = [
            "❌ Missing required environment variables:",
            ...result.missing.map(name => `  - ${name}`),
            "",
            "Please set these variables in your .env file or deployment environment.",
        ].join("\n");

        throw new Error(errorMessage);
    }

    if (result.warnings.length > 0) {
        console.warn("⚠️ Environment warnings:");
        result.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
}

/**
 * Get a required environment variable or throw an error
 */
export function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
}
