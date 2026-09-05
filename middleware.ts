import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Public APIs and marketing pages. Authenticated app routes are /dashboard
// and /v/* (see isProtectedPage). Unknown pages render the 404 instead of
// bouncing to sign-in.
const isPublicRoute = createRouteMatcher([
  "/",
  "/p/(.*)",
  "/attest/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about",
  "/how-it-works",
  "/uses",
  "/privacy",
  "/terms",
  "/verify",
  "/verify-guide",
  "/tools",
  "/changelog",
  "/glossary",
  "/faq",
  "/security",
  "/contact",
  "/thanks",
  "/for-reviewers",
  "/api/public/(.*)",
  // Witness confirmation: the unguessable token is the auth. The page at
  // /attest/(.*) is already public; this is the POST that page calls.
  "/api/attestations/confirm",
  // Public verification surface. Proof pages load these without auth.
  "/api/venture/(.*)",
  "/api/block-header/(.*)",
  "/api/verify-bitcoin",
  "/api/anchor/(.*)/proof",
  // Resend inbound webhook (verified via RESEND_WEBHOOK_SECRET / Svix).
  "/api/ingest/email",
  // Stripe inbound webhooks (verified via per-venture HMAC secret).
  "/api/stripe/webhook/(.*)",
]);

const isProtectedPage = createRouteMatcher(["/dashboard(.*)", "/v/(.*)"]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/")) {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
    return;
  }
  if (isProtectedPage(req)) {
    await auth.protect();
  }
});

export default function middleware(
  req: NextRequest,
  event: Parameters<typeof clerkHandler>[1],
) {
  // Bypass Clerk entirely. The route verifies CRON_SECRET itself; Clerk
  // would treat that Bearer token as a JWT and reject the request.
  if (req.nextUrl.pathname === "/api/anchor/upgrade") {
    return NextResponse.next();
  }
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
