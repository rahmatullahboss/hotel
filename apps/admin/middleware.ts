import { auth } from "./auth";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth?.user;
    const isAdmin = (req.auth?.user as { role?: string })?.role === "ADMIN";

    // Public paths that don't require authentication
    const publicPaths = ["/auth/signin", "/auth/error", "/api/auth"];
    const isPublicPath = publicPaths.some(path => nextUrl.pathname.startsWith(path));

    if (isPublicPath) {
        return;
    }

    // Redirect unauthenticated users to signin
    if (!isLoggedIn) {
        const signInUrl = new URL("/auth/signin", nextUrl);
        signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(signInUrl);
    }

    // Redirect non-admin users to error page
    if (!isAdmin) {
        const errorUrl = new URL("/auth/error?error=AccessDenied", nextUrl);
        return Response.redirect(errorUrl);
    }
});

export const config = {
    matcher: [
        // Match all paths except static files and api routes we want to exclude
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
