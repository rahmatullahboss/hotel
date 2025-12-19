import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no database adapter)
// Middleware only needs to verify the JWT session, not query the database
const authConfig: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    session: { strategy: "jwt" },
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

            // Public paths that don't require authentication
            const publicPaths = ["/auth/signin", "/auth/error", "/api/auth", "/api/cron"];
            const isPublicPath = publicPaths.some(path => nextUrl.pathname.startsWith(path));

            if (isPublicPath) {
                return true;
            }

            // Redirect unauthenticated users to signin
            if (!isLoggedIn) {
                const signInUrl = new URL("/auth/signin", nextUrl);
                signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
                return Response.redirect(signInUrl);
            }

            // Allow all authenticated users - role-based access is handled at page level
            return true;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
};

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
    matcher: [
        // Match all paths except static files and api routes we want to exclude
        "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
