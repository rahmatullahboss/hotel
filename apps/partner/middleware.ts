import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ["/auth/signin", "/auth/error", "/api/auth", "/api/cron"];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to signin
    if (!session?.user) {
        const signInUrl = new URL("/auth/signin", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Allow all authenticated users - role-based access is handled at page level
    // This allows new users to complete OAuth flow and see appropriate messages
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths except static files and api routes we want to exclude
        "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
