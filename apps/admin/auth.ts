import NextAuth from "next-auth";
import { authConfig } from "@repo/config/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAdmin = (auth?.user as { role?: string })?.role === "ADMIN";

            // Allow access to login page
            if (nextUrl.pathname.startsWith("/auth/signin")) {
                return true;
            }

            // Redirect unauthenticated users
            if (!isLoggedIn) {
                return false;
            }

            // Redirect non-admin users
            if (isLoggedIn && !isAdmin) {
                return Response.redirect(new URL("/auth/error?error=AccessDenied", nextUrl));
            }

            return true;
        },
    },
    pages: {
        ...authConfig.pages,
        signIn: "/auth/signin", // We'll need to create this or share it
    },
});
