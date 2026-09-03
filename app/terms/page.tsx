import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";
import { LegalDeck, type LegalSection } from "@/app/components/LegalDeck";

export const metadata: Metadata = {
  title: "Terms of Service · Beleg",
  description:
    "The terms for using Beleg: what a sealed line proves, what it does not, public pages, acceptable use, and the limits of a beta service.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "The agreement",
    cards: [
      {
        id: "accept",
        icon: "duty",
        title: "Acceptance",
        body: "Using Beleg is agreement to these terms and to the privacy policy.",
        more: [
          "These terms govern belegapp.com and the hosted application. If you do not agree, do not create an account, do not send a witness link, and do not publish a proof page.",
          "If you use Beleg for an organization, you are saying you have authority to bind it. The privacy policy at /privacy is part of this agreement. If the two conflict on a data-handling fact, the privacy policy controls for that fact.",
        ],
      },
      {
        id: "age",
        icon: "age",
        title: "Age",
        body: "13 or older. Under 18 needs a parent or guardian.",
        more: [
          "If you are under 13, do not create an account and do not confirm a witness link. If you are 13 to 17, you represent that a parent or guardian has agreed to these terms.",
          "We will delete an account we learn belongs to a child under 13.",
        ],
      },
      {
        id: "what",
        icon: "tool",
        title: "What this is",
        body: "A hosted, append-only ledger. Not a notary, bank, court, or auditor.",
        more: [
          "Beleg lets you record milestones, collect named confirmations, publish a proof page, and date the newest seal on Bitcoin through OpenTimestamps. That is the whole product.",
          "Beleg is not a legal document system, a notary public, a qualified timestamp authority under eIDAS, a financial product, a payment processor, an archive with a retention warranty, or a stand-in for a lawyer, accountant, or auditor. Do not file a Beleg page as certified evidence and expect that label to hold.",
        ],
      },
      {
        id: "accounts",
        icon: "user",
        title: "Accounts",
        body: "You are responsible for the Clerk login and for what is sealed under it.",
        more: [
          "Keep the sign-in method in your control. Activity under your account is treated as yours. Tell us if you lose the login. We cannot unwind seals that were made before you wrote us.",
          "One person, one account, unless we agree otherwise. Do not share a login to evade a limit, a suspension, or a deletion.",
        ],
      },
    ],
  },
  {
    heading: "Your content and the public record",
    cards: [
      {
        id: "license",
        icon: "file",
        title: "Your content",
        body: "You own what you type. You give us a license to host it and to show a page you published.",
        more: [
          "You retain whatever rights you have in the words, names, and files you submit. You grant Beleg a non-exclusive, worldwide, royalty-free license to store, hash, timestamp, display, transmit, and back up that content as needed to run the service — including sending a witness email you requested and rendering a public page at a slug you created.",
          "You represent that you have the right to submit the content, that it is accurate to your knowledge, and that it does not violate the law or someone else's rights. You will not put credentials, private keys, or other people's sensitive data on a ledger.",
        ],
      },
      {
        id: "public",
        icon: "globe",
        title: "Public pages",
        body: "A proof URL is a publication. Anyone with the link can read and copy it.",
        more: [
          "The page at /p/[slug], the JSON at /api/public/[slug]/entries, the venture verification payload, and the raw .ots download are unauthenticated. The JSON feed allows any origin to read it so a reviewer can verify without trusting us.",
          "We do not promise robots.txt, cloaking, or takedown from third-party archives. If you share the slug, you chose to publish. If you need a record that must never leave a locked room, do not use Beleg.",
        ],
      },
      {
        id: "proves",
        icon: "truth",
        title: "What a seal proves",
        body: "The words were recorded then, in that order, and have not been rewritten here.",
        more: [
          "A sealed entry saying you signed a $50K contract proves you wrote that sentence, on this service, at that position in the chain. A Bitcoin date proves the newest hash existed at a calendar time nobody at Beleg controls.",
          "That is all it proves. Reviewers recompute the hashes in their own browser. They do not have to believe a badge we drew.",
        ],
      },
      {
        id: "not",
        icon: "alert",
        title: "What it does not prove",
        body: "Truth, quality, authority, or that a missing witness means it never happened.",
        more: [
          "A named person confirmed a statement. That is not the same as the statement being true. Bitcoin dating does not audit the contents. A public page is not a certified document, a notarized affidavit, a court record, or a substitute for original contracts and receipts.",
          "Do not tell a reviewer, an investor, a court, or a journalist that Beleg verified the underlying event. It verified that the line was not quietly edited.",
        ],
      },
      {
        id: "attest",
        icon: "stamp",
        title: "Witnesses",
        body: "You are asking a real person to put their name and email on a public record.",
        more: [
          "Do not invent attesters. Do not request a confirmation from someone who did not agree. Do not harvest emails. A confirmation cannot be pulled back. The sealed credit includes the name and email they used.",
          "Witnesses should only confirm what they know. Confirming a link is a public act. Abuse of the witness flow — spam, impersonation, coercion — is grounds to close the account and, if needed, to report it.",
        ],
      },
      {
        id: "append",
        icon: "chain",
        title: "Append-only",
        body: "No edit. No delete of a single line. Think before you seal.",
        more: [
          "A correction is a new entry. The original stays. If you need the whole ledger or account gone, email beleg.app@proton.me. We delete the hosted rows we control within 30 days.",
          "Deletion does not unsay a Bitcoin timestamp and does not erase copies a reviewer already saved. Read the privacy page before you publish.",
        ],
      },
      {
        id: "connectors",
        icon: "cloud",
        title: "Email and Stripe",
        body: "Optional hooks. You are responsible for what they write onto the chain.",
        more: [
          "Whitelisting a sender authorizes us to turn matching inbound mail into entries, which may include running a short extraction model over the subject and body. Connecting Stripe authorizes us to turn matching webhook events into entries.",
          "Those entries are yours. Revoking a connection stops new writes. It does not remove what was already sealed.",
        ],
      },
    ],
  },
  {
    heading: "Acceptable use",
    cards: [
      {
        id: "duty",
        icon: "duty",
        title: "Your responsibilities",
        body: "Record what happened. Do not fake a witness, an identity, or a flood.",
        more: [
          "You will not use Beleg to commit fraud, impersonate someone, threaten, stalk, or publish illegal content. You will not submit other people's personal data without a lawful basis. You own the accuracy of what you type.",
          "You will not attempt to bypass rate limits, Turnstile, webhook signatures, or ownership checks. You will not probe another person's ledger, scrape the public API in a way that degrades the service, or try to exhaust database connections, function time, or outbound calendars.",
          "You will not resell the service as a generic timestamp API, mine it for training data, or use it to operate an open relay for mail or webhooks.",
        ],
      },
      {
        id: "abuse",
        icon: "ban",
        title: "What we will shut down",
        body: "Fraud, spam, impersonation, and attacks on the public routes.",
        more: [
          "We can refuse a request, disable a hook, close an account, or take a public page offline if we believe it is being used to attack the service, to defraud someone, or to publish content we are not willing to host.",
          "We do not have a general duty to moderate ledgers. A public page is the owner's publication. We will act when we have a legal obligation, a security reason, or a clear abuse of the witness and ingest paths.",
        ],
      },
    ],
  },
  {
    heading: "The service and the risk",
    cards: [
      {
        id: "beta",
        icon: "cloud",
        title: "Availability",
        body: "Beta. Free. Bugs, downtime, and breaking changes are possible.",
        more: [
          "There is no uptime promise, no SLA, no support contract, and no warranty that a feature will remain. Verification depends on browsers, public Bitcoin calendars, and third-party explorers we do not operate.",
          "We may change, suspend, or end the hosted service. If we shut it down we will try to leave owners a window to export JSON and .ots files, but we do not promise that window.",
        ],
      },
      {
        id: "disclaimer",
        icon: "alert",
        title: "No warranty",
        body: "Provided as-is and as-available. We do not warrant fitness for a legal or financial use.",
        more: [
          "To the fullest extent the law allows, Beleg disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, title, and non-infringement.",
          "We do not warrant that hashes will always recompute, that a calendar will upgrade a proof, that a vendor will remain available, or that a public page will stay online.",
        ],
      },
      {
        id: "liability",
        icon: "shield",
        title: "Liability",
        body: "We are not on the hook for decisions you make from a sealed line.",
        more: [
          "To the fullest extent the law allows, Beleg and the people who operate it are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, lost reputation, or substitute services, even if we were told they were possible.",
          "That includes disputes over a witness statement, a Stripe-ingested payment line, an inbound email, a missed upgrade on an OpenTimestamps proof, downtime, and a reviewer who misunderstands what a seal proves.",
          "Our total liability for any claim relating to the service is limited to the amount you paid us for the service in the three months before the claim. The service is currently free, so that amount is zero. Some places do not allow these limits. In those places, the limits apply to the maximum extent permitted.",
        ],
      },
      {
        id: "indemnity",
        icon: "scale",
        title: "Indemnity",
        body: "If your content or your use gets us sued, you cover it.",
        more: [
          "You will defend and indemnify Beleg and the people who operate it against claims, damages, and reasonable legal fees arising from your content, your witness requests, your connectors, your violation of these terms, or your violation of someone else's rights.",
          "We will notice you when we can. We may assume control of the defense. You will not settle a claim that names us without our written agreement.",
        ],
      },
      {
        id: "stop",
        icon: "ban",
        title: "Termination",
        body: "You can leave any time. We can close accounts used for fraud or for an attack.",
        more: [
          "Ask for a full delete and we will remove the hosted rows we control within 30 days, subject to the limits on the privacy page. We can suspend or close an account immediately for abuse, unpaid legal risk, or a threat to the service.",
          "Sections that by their nature should survive — including public-record warnings, disclaimers, liability limits, indemnity, and governing law — survive termination.",
        ],
      },
      {
        id: "law",
        icon: "scale",
        title: "Governing law",
        body: "Pennsylvania law. Courts in Pennsylvania, unless a statute says otherwise.",
        more: [
          "These terms are governed by the laws of the Commonwealth of Pennsylvania, without regard to conflict-of-law rules. You and Beleg agree to the exclusive jurisdiction of the state and federal courts located in Pennsylvania, except that we may still seek injunctive relief anywhere to stop abuse of the service.",
          "If you are a consumer in a place that forbids this choice of forum, the mandatory rules of that place apply instead.",
        ],
      },
      {
        id: "changes",
        icon: "clock",
        title: "Changes",
        body: "We may update these terms. Using the app after the new date is acceptance.",
        more: [
          "The date at the top of this page is the live version. We will not hide a new restriction on public routes or a new liability limit in a commit message.",
          "If you cannot accept an update, stop using the service and ask us to delete the account.",
        ],
      },
      {
        id: "misc",
        icon: "file",
        title: "Other terms",
        body: "This is the whole agreement. If a court strikes one line, the rest stays.",
        more: [
          "These terms and the privacy policy are the entire agreement for the hosted service. They replace prior versions. A failure to enforce a line is not a waiver. You may not assign the agreement without our consent. We may assign it as part of a transfer of the service.",
          "Headings are for reading, not for interpretation. There are no third-party beneficiaries except as needed for the indemnity.",
        ],
      },
      {
        id: "contact",
        icon: "mail",
        title: "Contact",
        body: "beleg.app@proton.me",
        more: [
          "That is the address for terms, deletion, a security report, and anything else. There is no other official channel.",
        ],
        href: {
          label: "Write beleg.app@proton.me",
          url: "mailto:beleg.app@proton.me",
        },
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="landing lp ip">
      <LegalDeck
        kicker="Terms"
        title="The rules for sealing a line, publishing a page, and living with what cannot be unsayable."
        lead="By using Beleg you agree to these terms. If you disagree, do not use the service. A sealed line proves the words were not rewritten. It does not prove they were true. Click a card for the rest of the sentence."
        updated="Last updated September 2, 2026"
        sections={SECTIONS}
      />
      <Footer />
    </main>
  );
}
