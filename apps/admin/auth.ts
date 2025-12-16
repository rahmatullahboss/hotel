import NextAuth from "next-auth";
import { getAuthConfig } from "@repo/config/auth";

// Use the function pattern - NextAuth calls getAuthConfig per-request
// This ensures DB connections are created at request time, not module load time
export const { handlers, auth, signIn, signOut } = NextAuth(getAuthConfig);
