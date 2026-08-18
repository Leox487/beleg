import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-stack">
        <p className="auth-note">
          Beleg is free while in beta. You only need an email.
        </p>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
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
