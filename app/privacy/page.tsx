import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";
import { LegalDeck, type LegalSection } from "@/app/components/LegalDeck";

export const metadata: Metadata = {
  title: "Privacy Policy · Beleg",
  description:
    "What Beleg collects, including account data, ledger text, witness details, IP addresses used for abuse prevention, and every vendor that can see a copy.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Who holds the data",
    cards: [
      {
        id: "controller",
        icon: "user",
        title: "Operator",
        body: "Beleg, from Philadelphia. The inbox is beleg.app@proton.me.",
        more: [
          "Beleg operates belegapp.com and the related application. There is no separate privacy office. That address is the contact for access, deletion, a complaint, or a question about this page.",
          "We process personal data as the controller for the hosted service. If you publish a public proof page, you decide what goes on it. Reviewers who open a link you sent them are reading a record you chose to share.",
        ],
        href: {
          label: "Write beleg.app@proton.me",
          url: "mailto:beleg.app@proton.me",
        },
      },
      {
        id: "scope",
        icon: "globe",
        title: "Who this covers",
        body: "Anyone who opens the site, creates an account, confirms a witness link, or hits a public API route.",
        more: [
          "That includes signed-in founders, witnesses who never create an account, reviewers who only open a proof page, and automated clients that call the public JSON or verification routes.",
          "It also covers people whose details appear because a user typed them, forwarded an email, or connected Stripe. If your name or address is on someone else's ledger, write us. We will tell you what we hold and what we can delete without breaking another person's account.",
        ],
      },
    ],
  },
  {
    heading: "What we collect",
    cards: [
      {
        id: "account",
        icon: "user",
        title: "Account",
        body: "Email, name, and a Clerk user id, collected when you sign up.",
        more: [
          "Sign-in is handled by Clerk. We store the Clerk user id on each ledger we create for you so we can tell which records you own. We do not ask for a phone number, a government ID, a date of birth, or a billing address.",
          "Clerk may also keep session metadata, device signals, and the authentication events it needs to keep an account signed in. Their processing is described in Clerk's own privacy policy.",
        ],
      },
      {
        id: "venture",
        icon: "file",
        title: "Ledger data",
        body: "Names, titles, bodies, dates, kinds, hashes, and the seals you create.",
        more: [
          "This is the product: an append-only chain of what you recorded. We store the words you typed, the timestamps, the previous-hash links, and the SHA-256 seals computed from them.",
          "A public proof page and the machine-readable feed at /api/public/[slug]/entries expose the same record to anyone who has the URL. Do not put secrets, passwords, private keys, health data, or other people's personal data on a ledger unless you intend that record to be shown.",
        ],
      },
      {
        id: "attest",
        icon: "stamp",
        title: "Witness data",
        body: "Name, email, statement, optional note, and the time they confirmed.",
        more: [
          "Witnesses do not create accounts. Authentication is the unguessable link. We store the pending request, then the confirmation, then a sealed chain entry that credits the witness by name and email.",
          "A confirmed witness is public on the proof page. Pending requests are not. Confirmations cannot be pulled back. If a witness writes us, we can explain what was stored. We cannot unsay a sealed line without deleting the whole ledger.",
        ],
      },
      {
        id: "email-ingest",
        icon: "mail",
        title: "Inbound email",
        body: "Sender, recipient, subject, body, headers, and a DKIM result.",
        more: [
          "If you whitelist a sender and mail arrives at your ledger address, we receive the message through Resend, store enough of it to create an entry, and may send a slice of the subject and body to Anthropic (Claude Haiku) to extract a short milestone title.",
          "The model is instructed not to invent facts. If extraction fails, we fall back to the subject and the first part of the body. Do not forward mail you are not allowed to store. We do not read your inbox at large — only messages delivered to the ingest address.",
        ],
      },
      {
        id: "stripe",
        icon: "archive",
        title: "Stripe events",
        body: "Payment and subscription events, only if you connect a webhook.",
        more: [
          "Connecting Stripe is optional. When you do, we store a per-venture webhook secret and encrypted credentials needed to receive events. Successful payments and some subscription events become ledger entries (amount, currency, a customer email if Stripe sent one, and an id).",
          "We are not your payment processor. Card numbers do not touch Beleg. Disconnecting Stripe stops new events. Entries already sealed stay on the chain.",
        ],
      },
      {
        id: "security",
        icon: "log",
        title: "Security data",
        body: "IP address, user agent, route, and bot-check tokens. Used to stop abuse.",
        more: [
          "Every request that reaches Vercel can appear in platform logs with an IP address, a user agent, a path, a status code, and a time. We use the first x-forwarded-for address to apply rate limits on public and authenticated write routes.",
          "Rate-limit counters are stored either in Upstash Redis (when configured) or in a Postgres table. The key is an action name plus an IP or a user id — not the body of your ledger. Counters are kept only long enough to enforce the window, then pruned.",
          "Unauthenticated witness confirmations may require a Cloudflare Turnstile token. The token is sent to Cloudflare's siteverify endpoint. Cloudflare may see the visitor IP as part of that check. We do not use Turnstile, IPs, or rate-limit keys for advertising, profiling, or sale.",
          "There is no advertising pixel, no analytics SDK, and no third-party tracker on the pages. Hosting logs and abuse counters are not the same thing as a marketing tracker. We still disclose them because they are personal data.",
        ],
      },
      {
        id: "not",
        icon: "ban",
        title: "What we do not take",
        body: "Card numbers, government IDs, precise GPS, ad profiles, or a sale of the chain.",
        more: [
          "We do not sell personal information. We do not rent the chain. We do not run advertising, retargeting, or cross-context behavioral ads. We do not buy data about you from brokers.",
          "We do not ask for a Social Security number, passport, or driver's license. We do not collect precise geolocation. An IP address can imply a coarse region; we do not use it to map you.",
          "We do not read a connected Stripe account's full customer list. We only ingest the webhook events the connection is set up to receive.",
        ],
      },
    ],
  },
  {
    heading: "Why we collect it",
    cards: [
      {
        id: "purpose-service",
        icon: "tool",
        title: "To run the product",
        body: "Create accounts, seal entries, send witness mail, and show a proof page.",
        more: [
          "Without an account identifier we cannot tell which ledgers are yours. Without the text and hashes there is no chain. Without a witness email we cannot send the confirmation link you asked us to send.",
          "Legal basis under GDPR, where it applies: performance of a contract when you have an account, and legitimate interests in operating a hosted ledger for visitors and witnesses.",
        ],
      },
      {
        id: "purpose-security",
        icon: "shield",
        title: "To stop spam and floods",
        body: "IP limits, bot checks, and webhook signatures. This is the anti-abuse layer.",
        more: [
          "Public routes can be called without logging in: witness confirmation, Bitcoin verification, block-header fetches, public JSON, and inbound webhooks. Without limits, a script can fill the database, exhaust the host, or run up a bill on outbound calls.",
          "We therefore record IPs and action keys, reject clients that exceed a window, verify Cloudflare Turnstile on witness confirmations when a site key is set, and reject unsigned Resend or Stripe webhooks. Legal basis: legitimate interests in keeping the service available and in protecting other users, and, where required, compliance with a legal obligation to secure the system.",
          "This is not optional for the hosted service. If you do not want an IP address processed for rate limiting, do not use the public routes. A proof page you already published can still be fetched by others.",
        ],
      },
      {
        id: "purpose-law",
        icon: "scale",
        title: "To meet the law",
        body: "We keep what we must if a lawful request arrives, then no more.",
        more: [
          "We may process and retain data to respond to a valid legal process, to establish or defend a legal claim, or to handle a security incident. We do not volunteer user content to a third party for their marketing.",
          "If we receive a demand we believe is legally binding, we will narrow it where we can and notice you unless the law or a genuine emergency forbids notice.",
        ],
      },
      {
        id: "legal-bases",
        icon: "scale",
        title: "GDPR bases",
        body: "Contract, legitimate interests, consent for optional hooks, and legal duty.",
        more: [
          "Contract: creating an account, sealing entries, sending a witness email you requested, deleting a ledger you asked us to delete.",
          "Legitimate interests: securing public routes, preventing scrapers and floods, debugging outages, and showing a proof page at a URL the owner published.",
          "Consent: optional connections (inbound email whitelist, Stripe). You can revoke a connection. Sealed entries created while it was on remain on the chain.",
          "Legal obligation: tax, accounting, or a binding order, if one applies. We are a small beta product and do not currently issue invoices.",
        ],
      },
      {
        id: "ccpa",
        icon: "ban",
        title: "California and similar laws",
        body: "We do not sell or share personal information for cross-context ads.",
        more: [
          "In the last twelve months we have not sold personal information and have not shared it for cross-context behavioral advertising. We do not have actual knowledge of selling or sharing the personal information of anyone under 16.",
          "Categories we collect, in CPRA terms: identifiers (email, name, IP, Clerk id), customer records (ledger text you typed, witness statements), commercial information only if you connect Stripe (payment event summaries), internet activity (paths, user agents, rate-limit hits), and inferences only in the narrow sense that Claude may draft a title from an email you forwarded.",
          "Sensitive personal information is not requested. Do not put it on a public ledger. California residents may ask for access, deletion, correction, and a copy, and may not be discriminated against for exercising those rights. Write beleg.app@proton.me. We will need enough detail to find the account and will not honor a request we cannot verify.",
        ],
      },
    ],
  },
  {
    heading: "How it is handled",
    cards: [
      {
        id: "store",
        icon: "server",
        title: "Where it lives",
        body: "Postgres in the US. Auth with Clerk. Hosting on Vercel. Other vendors listed below.",
        more: [
          "Application data sits in a US-region Postgres database (Neon). Clerk holds authentication. Vercel serves the app and may process requests in the region closest to the visitor. Rate-limit keys may sit in Upstash Redis. Email goes through Resend. Optional model extraction uses Anthropic. Optional payments ingest uses Stripe. Bot checks use Cloudflare. Bitcoin dating uses public OpenTimestamps calendars. Block headers may be fetched from Blockstream.",
          "Those vendors are processors or independent controllers for their own services. We do not control their infrastructure. Each publishes its own terms and security page.",
        ],
      },
      {
        id: "public",
        icon: "globe",
        title: "Public proof pages",
        body: "Anyone with the URL can read the ledger, download the JSON, and fetch the .ots proof.",
        more: [
          "A public page is public. We do not put a login in front of /p/[slug], /api/public/[slug]/entries, /api/venture/[id], or /api/anchor/[id]/proof. The JSON feed sends Access-Control-Allow-Origin: * so an independent verifier can load it from another origin.",
          "We do not submit proof pages to a search index for you. Crawlers, archives, and people you forward the link to can still copy the page. Once a hash is dated on Bitcoin, we cannot remove that fingerprint from the calendar or the chain.",
          "Treat the slug as a capability. If you post it, you published the record.",
        ],
      },
      {
        id: "keep",
        icon: "archive",
        title: "Retention",
        body: "Ledgers until you delete them. Abuse counters for the window. Logs as the host keeps them.",
        more: [
          "Account and ledger data: until you ask us to delete the venture or the account, or we close an account for abuse. Append-only is the product. A single line cannot be edited or erased in place. A correction is a new entry.",
          "Witness records: for the life of the ledger they belong to. A confirmed witness is part of the public chain.",
          "Rate-limit rows: for the active window, then dropped by a nightly sweep (about a day of slack). Turnstile tokens are single-use and are not stored after verification.",
          "Webhook event ids: kept so a retry from Resend or Stripe cannot double-write an entry.",
          "Host logs: as long as Vercel retains them for the project. We do not run a separate analytics warehouse.",
          "Backups and replicas: a delete can take up to 30 days to leave residual copies. Bitcoin attestations and copies other people already downloaded are outside that clock.",
        ],
      },
      {
        id: "security-measures",
        icon: "lock",
        title: "How we protect it",
        body: "Signed-in writes, ownership checks, signed webhooks, and limits on public routes.",
        more: [
          "Signed-in routes require a Clerk session. Owner-scoped queries filter on your user id. SQL goes through parameterized queries. Entries have no edit or delete handler. Venture name and slug cannot be renamed, so an old proof link does not silently point at a different record.",
          "Public writes need an unguessable witness token or a verified webhook signature. Missing signing secrets fail closed. Witness confirmations are one-way. Rate limits apply across the fleet. Verification payloads are size-capped. Inbound email extraction times out rather than hanging a function.",
          "Transport is HTTPS. Database connections use TLS. Stripe secrets are stored encrypted at rest. No policy, including this one, is a warranty that a system cannot be broken. If you find a way to read another person's private ledger or rewrite a chain, write beleg.app@proton.me.",
        ],
      },
      {
        id: "rights",
        icon: "scale",
        title: "Your rights",
        body: "Access, correction, deletion, portability, objection. We answer in 30 days.",
        more: [
          "You can ask for a copy of what we hold about you, ask us to correct account fields we control, ask us to delete a ledger or an account, and ask for a portable export of your ledger JSON. EU and UK residents may also object to processing based on legitimate interests, restrict processing in the cases the law allows, and complain to a supervisory authority.",
          "Some rights have limits. We cannot edit a sealed line without destroying the product. We cannot erase a Bitcoin timestamp. We cannot force a reviewer to delete a page they already saved. We may refuse a request we cannot verify, or a request that would let one person wipe another person's account.",
          "Write beleg.app@proton.me from the address on the account when you can. Name the ledger slug if you know it.",
        ],
        href: {
          label: "Email beleg.app@proton.me",
          url: "mailto:beleg.app@proton.me",
        },
      },
      {
        id: "deletion-limits",
        icon: "alert",
        title: "What deletion cannot undo",
        body: "Bitcoin dates, copies already downloaded, and host backups still draining.",
        more: [
          "OpenTimestamps calendars and Bitcoin itself are not our database. A confirmed anchor proves a hash existed at a time we do not control. Deleting the Beleg row does not unsay that.",
          "Anyone who opened your public URL may still have the JSON, the .ots file, or a screenshot. We will remove the hosted page and the database rows we control within 30 days of a verified request.",
        ],
      },
    ],
  },
  {
    heading: "Vendors, cookies, and other rules",
    cards: [
      {
        id: "vendors",
        icon: "share",
        title: "Who else can see a copy",
        body: "Clerk, Neon, Vercel, Resend, Upstash, Cloudflare, Anthropic, Stripe, OpenTimestamps, Blockstream.",
        more: [
          "Clerk: account email, name, authentication. Neon: application database. Vercel: hosting, request logs, scheduled jobs. Resend: transactional mail and inbound email webhooks. Upstash: rate-limit keys when configured. Cloudflare: Turnstile bot checks on witness confirmation. Anthropic: optional milestone extraction from inbound mail. Stripe: optional payment events you connected. OpenTimestamps calendars: a hash, never the entry text. Blockstream: block heights and headers for verification, not your ledger.",
          "We do not sell or rent those copies. Each vendor is used to run or protect the service. If a vendor is added or dropped, this page is updated.",
        ],
      },
      {
        id: "transfers",
        icon: "globe",
        title: "International transfers",
        body: "The stack is US-hosted. A visitor outside the US still hits US processors.",
        more: [
          "If you access Beleg from the EEA, UK, or Switzerland, your data is transferred to the United States and processed there. We rely on the vendor's published transfer tools (such as Standard Contractual Clauses) where they offer them, and on the fact that a hosted US service cannot keep EU data in the EU with the current stack.",
          "Do not use Beleg if you cannot accept a US transfer.",
        ],
      },
      {
        id: "cookies",
        icon: "cookie",
        title: "Cookies and similar tech",
        body: "Session cookies for sign-in. Abuse counters are not cookies. No ad cookies.",
        more: [
          "Clerk sets cookies or similar storage to keep a session. Those are necessary for the authenticated product. We do not set advertising, social-media, or analytics cookies.",
          "Rate limiting uses the request IP and a server-side counter, not a tracking cookie. Turnstile may set a Cloudflare challenge cookie when the widget runs. That cookie is for the challenge, not for ads.",
          "There is no cookie banner because we do not use optional tracking cookies. A session cookie is required to stay signed in. You can block cookies in the browser; you will then be unable to use an account.",
        ],
      },
      {
        id: "automated",
        icon: "hash",
        title: "Automated processing",
        body: "Claude may draft a title from an inbound email. It does not decide your rights.",
        more: [
          "The only automated decision that touches content is optional email extraction. It proposes a title and a short body. It does not approve accounts, score people, or refuse a witness. You can ignore the drafted text by not using inbound email.",
          "Rate limits and Turnstile are automated security decisions. They can refuse a request. They do not produce a legal or similarly significant effect about you as a person beyond blocking a flood.",
        ],
      },
      {
        id: "kids",
        icon: "child",
        title: "Children",
        body: "Not for anyone under 13. We do not try to collect data from children.",
        more: [
          "If we learn an account belongs to a child under 13, we delete it. If you believe we have collected personal information from a child, write beleg.app@proton.me with enough detail to find the record.",
          "The terms also require that users under 18 have a parent or guardian's permission.",
        ],
      },
      {
        id: "law-enforcement",
        icon: "shield",
        title: "Legal demands",
        body: "We do not volunteer the chain. A binding order is a different case.",
        more: [
          "We may disclose data if we believe in good faith that the law requires it, or that disclosure is necessary to prevent serious harm, fraud against other users, or an ongoing attack on the service.",
          "We will ask for a warrant, court order, or equivalent process where the law allows us to do so, and we will notice the account holder unless prohibited.",
        ],
      },
      {
        id: "changes",
        icon: "clock",
        title: "Changes",
        body: "Material updates land on this page with a new date. The date is the record.",
        more: [
          "We will not bury a new processor, a new public write path, or a new use of IP addresses in a changelog footnote. If the change is material, the date at the top moves and the card that changed is rewritten.",
          "Continued use of the hosted service after the new date is acceptance of the updated policy. If you cannot accept it, stop using the service and ask us to delete the account.",
        ],
      },
      {
        id: "contact",
        icon: "mail",
        title: "Contact",
        body: "beleg.app@proton.me — access, deletion, a complaint, or a security report.",
        more: [
          "That address reaches a person in Philadelphia. Use it for a privacy request, a vendor question, or a report that a public page contains data that should not have been published.",
          "We aim to respond within 30 days. There is no contact form and no phone line.",
        ],
        href: {
          label: "Write beleg.app@proton.me",
          url: "mailto:beleg.app@proton.me",
        },
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="landing lp ip">
      <LegalDeck
        kicker="Privacy"
        title="What we hold, who else can see a copy, and what deletion cannot undo."
        lead="This is the live inventory of personal data on Beleg, including IP addresses used to rate-limit public routes and the bot check on witness confirmation. Nothing here is sold. Nothing is used for ads. Click a card for the rest of the sentence."
        updated="Last updated September 2, 2026"
        sections={SECTIONS}
      />
      <Footer />
    </main>
  );
}
