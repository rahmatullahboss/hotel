import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

// Drizzle commands are executed from packages/db. Load the monorepo-local
// environment file explicitly; hosted environments inject variables directly.
config({ path: resolve(process.cwd(), "../../.env") });

const migrationUrl = process.env.DATABASE_DIRECT_URL;

if (!migrationUrl) {
    throw new Error(
        "DATABASE_DIRECT_URL is required for Drizzle migration tooling. " +
        "Use the direct (non-pooled) Neon connection; DATABASE_URL is reserved for application traffic."
    );
}

export default defineConfig({
    schema: "./src/schema/index.ts",
    out: "./drizzle",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        url: migrationUrl,
    },
});
