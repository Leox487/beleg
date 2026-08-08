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
  "/api/public/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
