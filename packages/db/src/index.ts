import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create Neon client
const createClient = () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    const sql = neon(databaseUrl);
    return drizzle(sql, { schema });
};

// Singleton pattern for database client
let dbInstance: ReturnType<typeof createClient> | null = null;

export const getDb = () => {
    if (!dbInstance) {
        dbInstance = createClient();
    }
    return dbInstance;
};

// For direct import usage
export const db = new Proxy({} as ReturnType<typeof createClient>, {
    get(_, prop) {
        return getDb()[prop as keyof ReturnType<typeof createClient>];
    },
});

// Re-export schema and types
export * from "./schema";
export { schema };
