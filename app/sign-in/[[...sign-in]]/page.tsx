import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in · Beleg",
  description: "Sign in to your Beleg ledgers.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-stack">
        <p className="auth-note">
          Beleg is free while in public beta. A seal is not funding and not
          legal evidence. You only need an email.
        </p>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </main>
  );
}
