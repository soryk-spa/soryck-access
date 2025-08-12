import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/events/create",
  "/events/manage",
  "/profile(.*)",
  "/orders(.*)",
  "/admin(.*)",
  "/tickets(.*)",
]);

const isAPIRoute = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    try {
      await auth.protect();
    } catch {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirectTo", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (isAPIRoute(req)) {
    const response = NextResponse.next();

    if (process.env.NODE_ENV === "development") {
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    }

    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/(.*)",
  ],
};
