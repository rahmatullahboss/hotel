import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import * as schema from "@repo/db/schema";
const { users, accounts, sessions, verificationTokens } = schema;
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

/**
 * Shared Auth.js v5 configuration factory for all apps
 * 
 * IMPORTANT: This returns a FUNCTION, not the config directly.
 * This is required because Neon serverless cannot keep connections alive
 * between requests, so the DB client must be created inside the request handler.
 * 
 * Apps should use this pattern:
 * 
 * ```ts
 * import { getAuthConfig } from "@repo/config/auth";
 * import NextAuth from "next-auth";
 * 
 * export const { handlers, auth, signIn, signOut } = NextAuth(getAuthConfig);
 * ```
 */

// Create the DB client for adapter (without schema to pass PgDatabase type check)
const createAdapterDb = () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    const sql = neon(databaseUrl);
    // Don't pass schema to drizzle to avoid "is not PgDatabase" error in adapter
    return drizzle(sql);
};

// Create a separate client with schema for queries in authorize callback
const createQueryDb = () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    const sql = neon(databaseUrl);
    return drizzle(sql, { schema });
};

/**
 * Auth config factory function
 * 
 * This function is called per-request by NextAuth, ensuring that:
 * 1. Database connections are created fresh for each request (required for Neon serverless)
 * 2. Environment variables are read at runtime, not at module evaluation time
 */
export const getAuthConfig = (): NextAuthConfig => ({
    // Create adapter with fresh DB connection per request
    // adapter: DrizzleAdapter(createAdapterDb() as any, {
    //     usersTable: users,
    //     accountsTable: accounts,
    //     sessionsTable: sessions,
    //     verificationTokensTable: verificationTokens,
    // }),

    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),

        // Phone/OTP authentication can be added here
        // Credentials provider for development
        Credentials({
            name: "Development",
            credentials: {
                email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
                // Only for development - remove in production
                if (process.env.NODE_ENV !== "development") {
                    return null;
                }

                const email = credentials.email as string;
                if (!email) return null;

                // Find or create user for development
                const db = createQueryDb();
                const existingUser = await db.query.users.findFirst({
                    where: (users: any, { eq }: any) => eq(users.email, email),
                });

                if (existingUser) {
                    return existingUser;
                }

                // Create new user for development
                const [newUser] = await db
                    .insert(users)
                    .values({
                        email,
                        name: email.split("@")[0],
                        role: "TRAVELER",
                    })
                    .returning();

                return newUser ?? null;
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
            }
            return token;
        },

        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },

        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            return true;
        },
    },

    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },

    debug: process.env.NODE_ENV === "development",
});

// Legacy export for backwards compatibility (deprecated)
// WARNING: This will cause issues with Neon serverless - use getAuthConfig instead
export const authConfig: NextAuthConfig = {
    providers: [],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
};

// Extended session type for apps to use
export interface ExtendedSession {
    user: {
        id: string;
        role: string;
        email: string;
        name?: string | null;
        image?: string | null;
    };
}
