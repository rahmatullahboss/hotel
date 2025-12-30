import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to handle CORS for API routes
 * Allows Flutter web and other clients to access the API
 */
export function middleware(request: NextRequest) {
  // Check if this is an API route
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Handle preflight requests (OPTIONS)
  if (request.method === "OPTIONS" && isApiRoute) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With, x-client-platform",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // For regular requests, add CORS headers to the response
  const response = NextResponse.next();

  if (isApiRoute) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, x-client-platform"
    );
  }

  return response;
}

// Only run middleware on API routes
export const config = {
  matcher: "/api/:path*",
};
