export type UseCase = {
  id: string;
  label: string;
  category: string;
  /** How this person would actually use Beleg, in their own terms. */
  how: string;
  /** A plausible first ledger entry for them. */
  entry: { title: string; detail: string };
  /** Who they'd send the one-click witness link to. */
  witness: string;
  /** Where the public proof link ends up. */
  useIt: string;
  /** Workplace photo under /public/uses/{id}.webp */
  image: string;
  /** Short alt text for the workplace photo. */
  imageAlt: string;
};

/**
 * Deliberately short. A profession only earns a place here if a stranger
 * actually evaluates this person AND no authoritative registry already answers
 * the question better. Licensed trades and clinicians are verified by state
 * boards; court filings, permits, and property records are already public;
 * consumer platforms publish their own audience numbers. Beleg adds nothing
 * there, so those aren't listed.
 */
export const CATEGORIES = [
  "Founders & startups",
  "Small business & trades",
  "Grants, nonprofits & research",
  "Freelance & client work",
  "Students & new graduates",
  "Professional services",
  "Inside a company",
] as const;

/** Shown as quick-pick chips before the visitor opens the full list. */
export const FEATURED_IDS = [
  "small-business-owner",
  "startup-founder",
  "grant-applicant",
  "freelance-developer",
  "high-school-student",
];

export const USE_CASES: UseCase[] = [
  // --- Founders & startups ---
  {
    id: "startup-founder",
    label: "Startup founder",
    category: "Founders & startups",
    how: "You record each milestone the day it happens (first revenue, first hire, pilot signed) instead of reconstructing a timeline from memory when a term sheet conversation starts.",
    entry: {
      title: "First paying customer signed",
      detail:
        "Northline Logistics signed a 12-month contract at $1,400/mo after a 6-week pilot.",
    },
    witness: "The customer's operations lead who signed the pilot agreement.",
    useIt:
      "Paste the proof link in your data room so investors can check the traction slide themselves.",
    image: "/uses/startup-founder.webp",
    imageAlt: "Startup founder reviewing a product dashboard at a shared office desk",
  },
  {
    id: "solo-founder",
    label: "Solo founder / indie hacker",
    category: "Founders & startups",
    how: "You have no co-founder to corroborate your story, so the chain does it. Every ship, every revenue milestone, sealed the day it happened.",
    entry: {
      title: "Crossed $2k MRR",
      detail: "Stripe MRR hit $2,040 across 68 paying subscribers.",
    },
    witness:
      "An accountant or a long-time customer willing to confirm the revenue is real.",
    useIt:
      "Attach it to accelerator applications where solo founders get extra scrutiny.",
    image: "/uses/solo-founder.webp",
    imageAlt: "Solo founder working alone at a home desk",
  },
  {
    id: "accelerator-applicant",
    label: "Accelerator applicant",
    category: "Founders & startups",
    how: "Every applicant claims momentum. You show a sealed timeline proving your momentum predates the application deadline.",
    entry: {
      title: "Launched public beta",
      detail: "Beta opened to 250 waitlist signups; 91 activated in week one.",
    },
    witness: "A mentor or advisor who watched the launch happen.",
    useIt:
      "Drop the link in the application field that asks for traction evidence.",
    image: "/uses/accelerator-applicant.webp",
    imageAlt: "Founder demoing a product to mentors in an accelerator space",
  },
  {
    id: "hardware-founder",
    label: "Hardware / deep tech founder",
    category: "Founders & startups",
    how: "Long build cycles make progress invisible between demos. You seal each prototype milestone so the years of work are legible later.",
    entry: {
      title: "Prototype v3 passed thermal testing",
      detail:
        "Unit sustained 400W continuous for 90 minutes without throttling at an ambient 35°C.",
    },
    witness: "The lab or test facility engineer who ran the test.",
    useIt:
      "Include it in grant reports and diligence where technical progress must be dated.",
    image: "/uses/hardware-founder.webp",
    imageAlt: "Hardware engineer adjusting a prototype on a lab bench",
  },

  // --- Small business & trades ---
  {
    id: "small-business-owner",
    label: "Small business owner",
    category: "Small business & trades",
    how: "Banks, landlords, and buyers keep asking you to prove the business is real and growing. You build that record continuously instead of scrambling for paperwork each time.",
    entry: {
      title: "Second location lease signed",
      detail:
        "Signed a 5-year lease at 214 Bridge St after 14 straight months of profitability.",
    },
    witness: "Your landlord, your accountant, or your commercial loan officer.",
    useIt:
      "Share it with a lender reviewing a working-capital loan, or with a buyer during a sale.",
    image: "/uses/small-business-owner.webp",
    imageAlt: "Small business owner reviewing papers at a shop counter",
  },
  {
    id: "general-contractor",
    label: "General contractor",
    category: "Small business & trades",
    how: "Every bid asks about completed projects, and reference checks are slow and easy to stack. You seal each job at completion with the client confirming, so your track record is checkable instead of merely listed.",
    entry: {
      title: "Completed 4,200 sq ft commercial buildout",
      detail:
        "Delivered two weeks ahead of schedule, $8k under the approved budget.",
    },
    witness: "The property owner or the architect who signed off.",
    useIt: "Attach the link to bid packets and prequalification forms.",
    image: "/uses/general-contractor.webp",
    imageAlt: "General contractor reviewing blueprints on a job site",
  },

  // --- Grants, nonprofits & research ---
  {
    id: "grant-applicant",
    label: "Grant applicant",
    category: "Grants, nonprofits & research",
    how: "Reviewers read hundreds of polished essays. You give them something none of the others have: a sealed record with the funder's own confirmation in it.",
    entry: {
      title: "Grant received: $12,000",
      detail:
        "Awarded by the Civic Innovation Fund for the neighborhood mapping pilot.",
    },
    witness: "The program officer who administered the award.",
    useIt: "Paste the link in the next application's supporting-evidence field.",
    image: "/uses/grant-applicant.webp",
    imageAlt: "Grant applicant reviewing an application packet at a cafe",
  },
  {
    id: "nonprofit-director",
    label: "Nonprofit director",
    category: "Grants, nonprofits & research",
    how: "Funders want outcomes, not narrative. You seal program milestones and let partner organizations confirm them, building a record across grant cycles.",
    entry: {
      title: "Served 1,000th client",
      detail:
        "Reached 1,000 cumulative clients across the housing navigation program.",
    },
    witness: "A partner agency or the board chair.",
    useIt: "Attach it to renewal applications and annual reports to funders.",
    image: "/uses/nonprofit-director.webp",
    imageAlt: "Nonprofit director reviewing program materials in an office",
  },
  {
    id: "grant-writer",
    label: "Grant writer",
    category: "Grants, nonprofits & research",
    how: "You build a sealed evidence file for each client so the claims in your narrative are backed by dated, witnessed entries rather than your own summary.",
    entry: {
      title: "Client program hit 90% completion rate",
      detail:
        "Cohort 4 finished with 27 of 30 participants completing all sessions.",
    },
    witness: "The program manager who ran the cohort.",
    useIt: "Cite it in the narrative so reviewers can check any claim directly.",
    image: "/uses/grant-writer.webp",
    imageAlt: "Grant writer working through reports at a desk",
  },
  {
    id: "academic-researcher",
    label: "Academic researcher",
    category: "Grants, nonprofits & research",
    how: "You timestamp results and methods before publication, establishing precedence without disclosing the work itself.",
    entry: {
      title: "Completed replication of the primary result",
      detail:
        "Third independent run reproduced the effect at p < 0.01, n = 340.",
    },
    witness: "Your co-author or the lab director.",
    useIt:
      "Reference it in priority disputes and grant progress reports where dating matters.",
    image: "/uses/academic-researcher.webp",
    imageAlt: "Academic researcher reviewing results in a lab",
  },
  {
    id: "phd-student",
    label: "PhD student",
    category: "Grants, nonprofits & research",
    how: "You seal each chapter, experiment, and conference acceptance so years of scattered work turn into a dated, defensible record.",
    entry: {
      title: "Completed the third study in the dissertation",
      detail: "Data collection closed at n = 212; preregistered analysis run.",
    },
    witness: "Your advisor.",
    useIt:
      "Use it for fellowship applications and the academic job market packet.",
    image: "/uses/phd-student.webp",
    imageAlt: "PhD student studying in a library carrel",
  },
  {
    id: "community-organizer",
    label: "Community organizer",
    category: "Grants, nonprofits & research",
    how: "Impact is hard to quantify and easy to dispute. You seal turnout, wins, and coalition milestones with the people who were there confirming them.",
    entry: {
      title: "Petition reached 5,000 signatures",
      detail: "Delivered to the city council ahead of the zoning vote.",
    },
    witness: "A coalition partner or a council staffer who received it.",
    useIt: "Show funders and press a record they can independently check.",
    image: "/uses/community-organizer.webp",
    imageAlt: "Community organizer speaking with neighbors outdoors",
  },
  {
    id: "oss-maintainer",
    label: "Open-source maintainer",
    category: "Grants, nonprofits & research",
    how: "Your most valuable adoption is invisible: companies run your code in private and never say so publicly. You seal those confirmations so sponsorship conversations rest on more than a star count.",
    entry: {
      title: "Adopted by a Fortune 500 in production",
      detail:
        "Confirmed production deployment across their internal build tooling.",
    },
    witness: "The engineering lead at the adopting company.",
    useIt: "Include it in sponsorship and foundation grant applications.",
    image: "/uses/oss-maintainer.webp",
    imageAlt: "Open-source maintainer at a dual-monitor desk",
  },

  // --- Freelance & client work ---
  {
    id: "freelance-developer",
    label: "Freelance developer",
    category: "Freelance & client work",
    how: "NDAs often stop you from showing the work itself. You seal what you delivered and let the client confirm it, proving the engagement without leaking the code.",
    entry: {
      title: "Delivered payments integration",
      detail:
        "Shipped Stripe billing for a client's SaaS; cut checkout drop-off by 22%.",
    },
    witness: "The client's CTO or product owner.",
    useIt:
      "Send the proof link with proposals when your portfolio is under NDA.",
    image: "/uses/freelance-developer.webp",
    imageAlt: "Freelance developer reviewing work with a client",
  },
  {
    id: "freelance-designer",
    label: "Freelance designer",
    category: "Freelance & client work",
    how: "Much of your best work ships under someone else's brand, or never ships at all. You seal completed engagements so the client can vouch for work you can't display.",
    entry: {
      title: "Completed brand identity system",
      detail:
        "Delivered logo, type system, and a 40-page guideline document on schedule.",
    },
    witness: "The client's marketing director.",
    useIt: "Attach it to proposals when the portfolio piece stays confidential.",
    image: "/uses/freelance-designer.webp",
    imageAlt: "Freelance designer reviewing brand mockups at a desk",
  },
  {
    id: "freelance-writer",
    label: "Freelance writer",
    category: "Freelance & client work",
    how: "Ghostwritten work never carries your name, so your strongest credits are the ones you can't point to. You seal the assignment and have the editor confirm it.",
    entry: {
      title: "Ghostwrote a 6-part executive series",
      detail: "Six long-form pieces published under the CEO's byline.",
    },
    witness: "The editor or the communications lead who commissioned it.",
    useIt: "Show it to future clients who ask what you've actually written.",
    image: "/uses/freelance-writer.webp",
    imageAlt: "Freelance writer working in a notebook at a desk",
  },

  // --- Students & new graduates ---
  {
    id: "high-school-student",
    label: "High school student",
    category: "Students & new graduates",
    how: "Admissions officers can't tell a real project from an essay about one. You seal what you actually built or organized, with a teacher confirming it.",
    entry: {
      title: "Founded the robotics club",
      detail:
        "Grew from 4 to 31 members and placed third at the regional competition.",
    },
    witness: "Your faculty advisor or the competition organizer.",
    useIt:
      "Add the proof link to the additional-information section of your applications.",
    image: "/uses/high-school-student.webp",
    imageAlt: "High school student building a robotics project in a classroom",
  },
  {
    id: "undergraduate",
    label: "Undergraduate student",
    category: "Students & new graduates",
    how: "You seal research, internships, and side projects as they happen, so grad school and job applications rest on a dated record rather than a line you wrote later.",
    entry: {
      title: "Built and shipped a campus app",
      detail: "1,200 monthly active students by the end of the spring term.",
    },
    witness: "A professor or the student-life office.",
    useIt: "Share it with recruiters and graduate admissions committees.",
    image: "/uses/undergraduate.webp",
    imageAlt: "Undergraduate student on a campus walkway with a laptop bag",
  },
  {
    id: "bootcamp-grad",
    label: "Bootcamp graduate",
    category: "Students & new graduates",
    how: "Without a degree you get asked to prove your skills, and a portfolio link proves only that something exists. You seal each project and let instructors and real clients confirm you built it.",
    entry: {
      title: "Shipped a capstone for a real client",
      detail:
        "Built an inventory system now used daily by a 12-person business.",
    },
    witness: "The client using the system.",
    useIt: "Send it with job applications instead of a link-only portfolio.",
    image: "/uses/bootcamp-grad.webp",
    imageAlt: "Bootcamp graduate demoing software to a client",
  },

  // --- Professional services ---
  {
    id: "consultant",
    label: "Consultant",
    category: "Professional services",
    how: "Your results live inside client organizations under NDA. You seal the engagement and outcome, and let the client confirm it without publishing details.",
    entry: {
      title: "Cut client onboarding time by 40%",
      detail:
        "Redesigned the process; average ramp fell from 21 days to 12 over one quarter.",
    },
    witness: "The client executive who sponsored the project.",
    useIt: "Send it with proposals where references are slow to arrange.",
    image: "/uses/consultant.webp",
    imageAlt: "Consultant meeting with a client in a glass conference room",
  },
  {
    id: "coach",
    label: "Business / executive coach",
    category: "Professional services",
    how: "Coaching outcomes are notoriously unverifiable. Anonymous testimonials are the industry standard because nothing better exists. You seal client milestones, with their permission and confirmation, into a real record.",
    entry: {
      title: "Client closed their Series A",
      detail:
        "Coached the founder through an 8-month process ending in a $4M round.",
    },
    witness: "The client themselves.",
    useIt:
      "Show prospective clients evidence instead of anonymous testimonials.",
    image: "/uses/coach.webp",
    imageAlt: "Executive coach talking with a founder in a cafe",
  },

  // --- Inside a company ---
  {
    id: "product-manager",
    label: "Product manager",
    category: "Inside a company",
    how: "Credit for shipped work blurs across teams, and the colleagues who could vouch for you scatter after every reorg. You seal launches and outcomes while the people who saw them are still around.",
    entry: {
      title: "Launched self-serve onboarding",
      detail: "Cut time-to-first-value from 6 days to 40 minutes.",
    },
    witness: "Your engineering lead or your manager.",
    useIt: "Bring it to performance reviews and future interviews.",
    image: "/uses/product-manager.webp",
    imageAlt: "Product manager standing at a whiteboard with sticky notes",
  },
  {
    id: "sales-rep",
    label: "Sales representative",
    category: "Inside a company",
    how: "Quota attainment is the single most-discounted number on a résumé, because it becomes unverifiable the moment you leave. You seal it while you're still there, with a manager confirming.",
    entry: {
      title: "Closed the largest deal in company history",
      detail: "$1.2M three-year contract, 240% of annual quota.",
    },
    witness: "Your VP of Sales.",
    useIt:
      "Show it to hiring managers who've learned to discount résumé numbers.",
    image: "/uses/sales-rep.webp",
    imageAlt: "Sales representative shaking hands with a client",
  },
];

export function useCasesByCategory(): Map<string, UseCase[]> {
  const grouped = new Map<string, UseCase[]>();
  for (const category of CATEGORIES) grouped.set(category, []);
  for (const item of USE_CASES) {
    grouped.get(item.category)?.push(item);
  }
  return grouped;
}
