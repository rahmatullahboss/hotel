import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig, NextAuthResult } from "next-auth";

// Edge-compatible auth config (no database adapter)
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

            const publicPaths = ["/auth/signin", "/auth/signup", "/auth/error", "/api/auth", "/api/cron"];
            const isPublicPath = publicPaths.some(path => nextUrl.pathname.startsWith(path));

            if (isPublicPath) return true;
            if (!isLoggedIn) {
                const signInUrl = new URL("/auth/signin", nextUrl);
                signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
                return Response.redirect(signInUrl);
            }
            return true;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
};

const nextAuth: NextAuthResult = NextAuth(authConfig);

export default nextAuth.auth;

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
