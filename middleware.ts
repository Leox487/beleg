import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Public surface: landing, public proof pages, attestation pages, the
// informational/legal pages, and the Clerk auth screens. Everything else
// requires a signed-in user.
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

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
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
