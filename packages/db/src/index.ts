import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Enable WebSocket support for transactions
neonConfig.webSocketConstructor = globalThis.WebSocket;

// Create Neon client with transaction support
const createClient = () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    // Use Pool for WebSocket connection (supports transactions)
    const pool = new Pool({ connectionString: databaseUrl });
    return drizzleServerless(pool, { schema });
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
