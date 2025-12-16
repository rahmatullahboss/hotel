import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Enable WebSocket support for transactions
neonConfig.webSocketConstructor = globalThis.WebSocket;

// Create Neon client with transaction support (WebSocket-based)
const createClient = () => {
    // Prevent client-side execution
    if (typeof window !== "undefined") {
        console.warn("⚠️ Attempted to initialize database client in browser environment. This is likely a bundling issue.");
        return null as any;
    }

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    // Use Pool for WebSocket connection (supports transactions)
    const pool = new Pool({ connectionString: databaseUrl });
    return drizzleServerless(pool, { schema });
};

// Create HTTP-based client for Auth.js adapter (compatible with DrizzleAdapter)
// Note: No schema option is passed to keep the PgDatabase type check working
const createHttpClient = () => {
    if (typeof window !== "undefined") {
        return null as any;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    const sql = neon(databaseUrl);
    return drizzleHttp(sql, { schema });
};

// Singleton pattern for database client
let dbInstance: ReturnType<typeof createClient> | null = null;
let dbHttpInstance: ReturnType<typeof createHttpClient> | null = null;

export const getDb = () => {
    if (!dbInstance) {
        dbInstance = createClient();
    }
    return dbInstance!;
};

// HTTP-based client for Auth.js adapter compatibility
export const getDbHttp = () => {
    if (!dbHttpInstance) {
        dbHttpInstance = createHttpClient();
    }
    return dbHttpInstance!;
};

// For direct import usage - same as getDb but with lazy initialization
export const db = getDb();

// Re-export schema and types
export * from "./schema";
export { schema };
