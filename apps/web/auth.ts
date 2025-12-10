/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import { authConfig } from "@repo/config/auth";

const nextAuth = NextAuth({
    ...authConfig,
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
}) as any;

export const handlers = nextAuth.handlers;
export const auth: () => Promise<any> = nextAuth.auth;
export const signIn: any = nextAuth.signIn;
export const signOut: any = nextAuth.signOut;
