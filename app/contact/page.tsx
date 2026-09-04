import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Contact · Beleg",
  description:
    "Write beleg.app@proton.me for bugs, security issues, or data deletion. That address is the official contact for Beleg.",
};

export default function ContactPage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-narrow">
        <header className="doc-header">
          <p className="doc-eyebrow">Get in touch</p>
          <h1 className="h1 doc-title">Contact</h1>
        </header>

        <div className="card doc-body contact-address">
          <p className="contact-address-label">Official address</p>
          <p className="contact-address-value">
            <a href="mailto:beleg.app@proton.me">beleg.app@proton.me</a>
          </p>
          <p>
            That inbox is the contact for Beleg: bugs, security reports, data
            deletion, access requests, and anything else. There is no separate
            office line and no contact form. Write the address.
          </p>
          <p>Replies may take a few days.</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
