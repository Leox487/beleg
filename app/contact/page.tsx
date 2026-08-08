import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Contact — Beleg",
  description: "Get in touch about bugs, security issues, or data deletion.",
};

export default function ContactPage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-narrow">
        <header className="doc-header">
          <p className="doc-eyebrow">Get in touch</p>
          <h1 className="h1 doc-title">Contact</h1>
        </header>

        <div className="card doc-body">
          <p>
            Email <a href="mailto:beleg@proton.me">beleg@proton.me</a> for
            anything: bugs, security issues, data deletion requests, questions.
          </p>
          <p>
            Beleg is built by one person, so replies may take a few days. There
            is no contact form — a real inbox works better.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
