import { auth } from "./auth";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth?.user;

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

    // Allow all authenticated users - role-based access is handled at page level
    // This allows new users to complete OAuth flow and see appropriate messages
});

export const config = {
    matcher: [
        // Match all paths except static files and api routes we want to exclude
        "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

