import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const rateLimitMap = new Map<string, { count: number; resetTime: number }>();


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
  "/api/debug/(.*)",
]);
const isClerkAPIRoute = createRouteMatcher([
  "/api/clerk/(.*)",
  "/api/__clerk/(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  
  const ip = req.headers.get("x-forwarded-for") ?? 
             req.headers.get("x-real-ip") ?? 
             "unknown";
  
  
  const response = NextResponse.next();
  
  
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  
  if (process.env.NODE_ENV === "production") {
    // Strict CSP with specific domains for production
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.sorykpass.com https://*.clerk.dev https://*.clerk.accounts.dev https://js.stripe.com https://checkout.stripe.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://hcaptcha.com https://*.hcaptcha.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://hcaptcha.com https://*.hcaptcha.com; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "connect-src 'self' https://clerk.sorykpass.com https://*.clerk.dev https://*.clerk.accounts.dev https://api.clerk.dev https://api.stripe.com https://checkout.stripe.com https://www.google.com https://www.recaptcha.net https://hcaptcha.com https://*.hcaptcha.com wss://*.clerk.dev wss://*.clerk.accounts.dev; " +
      "frame-src 'self' https://clerk.sorykpass.com https://*.clerk.dev https://js.stripe.com https://checkout.stripe.com https://www.google.com https://www.recaptcha.net https://hcaptcha.com https://*.hcaptcha.com; " +
      "worker-src 'self' blob:; " +
      "object-src 'none'; " +
      "base-uri 'self';"
    );
  } else if (process.env.NODE_ENV === "development") {
    // More permissive CSP for development to allow CAPTCHA and debugging
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.dev https://*.clerk.accounts.dev https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://hcaptcha.com https://*.hcaptcha.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://hcaptcha.com https://*.hcaptcha.com; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "connect-src 'self' https://*.clerk.dev https://*.clerk.accounts.dev https://api.clerk.dev https://www.google.com https://www.recaptcha.net https://hcaptcha.com https://*.hcaptcha.com wss://*.clerk.dev wss://*.clerk.accounts.dev; " +
      "frame-src 'self' https://*.clerk.dev https://www.google.com https://www.recaptcha.net https://hcaptcha.com https://*.hcaptcha.com; " +
      "worker-src 'self' blob:; " +
      "object-src 'none'; " +
      "base-uri 'self';"
    );
  }

  
  if (isAPIRoute(req) && !isPublicAPIRoute(req) && !isClerkAPIRoute(req)) {
    if (!rateLimit(ip, 100, 15 * 60 * 1000)) { 
      console.warn(`rateLimit hit for ip=${ip} path=${req.nextUrl.pathname}`)
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: response.headers }
      );
    }
  }

  
  if (isProtectedRoute(req)) {
    try {
      const authResult = await auth();
      const userId = authResult.userId;
      console.log(`[middleware] auth check for path=${req.nextUrl.pathname} userId=${userId || 'none'} ip=${ip}`);
      
      if (!userId) {
        console.warn(`[middleware] no userId found for path=${req.nextUrl.pathname} ip=${ip} - redirecting to sign-in`);
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirectTo", req.url);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.warn(`[middleware] auth.protect() failed for path=${req.nextUrl.pathname} ip=${ip} error=${error}`);
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirectTo", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  
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
