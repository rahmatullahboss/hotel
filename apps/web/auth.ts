/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import { getAuthConfig } from "@repo/config/auth";

// Use the function pattern - NextAuth calls getAuthConfig per-request
// This ensures DB connections are created at request time, not module load time
const nextAuth = NextAuth(getAuthConfig) as any;

export const handlers = nextAuth.handlers;
export const auth: () => Promise<any> = nextAuth.auth;
export const signIn: any = nextAuth.signIn;
export const signOut: any = nextAuth.signOut;
