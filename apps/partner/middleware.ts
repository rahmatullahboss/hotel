import { auth } from "./auth";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth?.user;
    const userRole = (req.auth?.user as { role?: string })?.role;
    const isPartner = userRole === "PARTNER";
    const isAdmin = userRole === "ADMIN";

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

    // Allow admins access (they can also manage as partners)
    if (isAdmin) {
        return;
    }

    // Redirect non-partner users to error page
    if (!isPartner) {
        const errorUrl = new URL("/auth/error?error=AccessDenied", nextUrl);
        return Response.redirect(errorUrl);
    }
});

export const config = {
    matcher: [
        // Match all paths except static files and api routes we want to exclude
        "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
