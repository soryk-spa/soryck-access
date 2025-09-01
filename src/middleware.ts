import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting - simple in-memory store (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Helper function for rate limiting
function rateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const record = rateLimitMap.get(ip);
  if (!record || record.resetTime <= windowStart) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/events/create",
  "/events/manage",
  "/profile(.*)",
  "/orders(.*)",
  "/admin(.*)",
  "/tickets(.*)",
  "/organizer(.*)",
]);

const isAPIRoute = createRouteMatcher(["/api/(.*)"]);
const isPublicAPIRoute = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/api/health",
  "/api/status",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Get client IP for rate limiting
  const ip = req.headers.get("x-forwarded-for") ?? 
             req.headers.get("x-real-ip") ?? 
             "unknown";
  
  // Security headers for all responses
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // CSP for enhanced security
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.dev https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://*.clerk.accounts.dev https://api.clerk.dev wss://*.clerk.accounts.dev;"
    );
  }

  // Rate limiting for API routes (except webhooks)
  if (isAPIRoute(req) && !isPublicAPIRoute(req)) {
    if (!rateLimit(ip, 100, 15 * 60 * 1000)) { // 100 requests per 15 minutes
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: response.headers }
      );
    }
  }

  // Protection for private routes
  if (isProtectedRoute(req)) {
    try {
      await auth.protect();
    } catch {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirectTo", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // CORS for API routes (development only)
  if (isAPIRoute(req) && process.env.NODE_ENV === "development") {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/(.*)",
  ],
};
