import NextAuth from "next-auth";
import { authConfig } from "@repo/config/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    // Middleware handles authorization, so we only need to keep jwt/session callbacks
    callbacks: {
        ...authConfig.callbacks,
        // Remove the authorized callback - middleware.ts handles route protection
    },
    pages: {
        ...authConfig.pages,
        signIn: "/auth/signin",
        error: "/auth/error",
    },
});

