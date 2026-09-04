import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign up · Beleg",
  description:
    "Create a Beleg account. Public beta. A seal is not funding and not legal evidence.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-stack">
        <p className="auth-note">
          Beleg is free while in public beta. A seal is not funding and not
          legal evidence. You only need an email.
        </p>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/thanks"
        />
        <p className="auth-legal">
          By signing up, you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
