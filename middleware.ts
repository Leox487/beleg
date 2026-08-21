import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
  "/changelog",
  "/glossary",
  "/faq",
  "/security",
  "/contact",
  "/for-reviewers",
  "/api/public/(.*)",
  // Public verification surface. Proof pages load these without auth.
  "/api/venture/(.*)",
  "/api/block-header/(.*)",
  "/api/verify-bitcoin",
  "/api/anchor/(.*)/proof",
  // Cron: OpenTimestamps upgrade. Guarded by CRON_SECRET, not Clerk.
  "/api/anchor/upgrade",
  "/api/anchor/upgrade(.*)",
  // Resend inbound webhook (verified via RESEND_WEBHOOK_SECRET / Svix).
  "/api/ingest/email",
  // Stripe inbound webhooks (verified via per-venture HMAC secret).
  "/api/stripe/webhook/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run Clerk on app pages and API routes, except static files, Next
    // internals, and the OTS cron. Do not use a separate "/(api|trpc)(.*)"
    // matcher — that re-includes /api/anchor/upgrade and Clerk then treats
    // CRON_SECRET Bearer as a JWT.
    "/((?!.+\\.[\\w]+$|_next|api/anchor/upgrade).*)",
  ],
};
