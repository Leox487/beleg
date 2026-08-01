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
};

export const CATEGORIES = [
  "Founders & startups",
  "Small business & trades",
  "Grants, nonprofits & research",
  "Freelance & creative",
  "Students & academics",
  "Professional services",
  "Health, wellness & care",
  "Creators & community",
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
  // ——— Founders & startups ———
  {
    id: "startup-founder",
    label: "Startup founder",
    category: "Founders & startups",
    how: "You record each milestone the day it happens — first revenue, first hire, pilot signed — instead of reconstructing a timeline from memory when a term sheet conversation starts.",
    entry: {
      title: "First paying customer signed",
      detail:
        "Northline Logistics signed a 12-month contract at $1,400/mo after a 6-week pilot.",
    },
    witness: "The customer's operations lead who signed the pilot agreement.",
    useIt:
      "Paste the proof link in your data room so investors can check the traction slide themselves.",
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
  },
  {
    id: "technical-cofounder",
    label: "Technical co-founder",
    category: "Founders & startups",
    how: "You seal what you built and when, so equity conversations and future disputes rest on a dated record rather than competing recollections.",
    entry: {
      title: "Shipped v1 of the matching engine",
      detail:
        "Core matching service deployed to production, handling 400 req/min at p95 under 120ms.",
    },
    witness:
      "Your co-founder or the first engineer who reviewed the deployment.",
    useIt: "Reference it during equity, vesting, or IP ownership discussions.",
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
  },

  // ——— Small business & trades ———
  {
    id: "small-business-owner",
    label: "Small business owner",
    category: "Small business & trades",
    how: "Banks, landlords, and lenders keep asking you to prove the business is real and growing. You build that record continuously instead of scrambling for paperwork each time.",
    entry: {
      title: "Second location lease signed",
      detail:
        "Signed a 5-year lease at 214 Bridge St after 14 straight months of profitability.",
    },
    witness: "Your landlord, your accountant, or your commercial loan officer.",
    useIt:
      "Share it with a lender reviewing a working-capital loan, or with a buyer during a sale.",
  },
  {
    id: "restaurant-owner",
    label: "Restaurant / café owner",
    category: "Small business & trades",
    how: "You seal health inspections, supplier relationships, and expansion milestones — the things a franchisor, investor, or buyer will eventually ask you to document.",
    entry: {
      title: "Passed health inspection with 98/100",
      detail:
        "County inspection completed with no critical violations; report #4471.",
    },
    witness: "Your supplier, your GM, or the landlord.",
    useIt:
      "Show it to a franchise partner or investor evaluating a second location.",
  },
  {
    id: "retail-owner",
    label: "Retail shop owner",
    category: "Small business & trades",
    how: "You record wholesale accounts, seasonal revenue records, and brand partnerships as they land, so growth is documented rather than remembered.",
    entry: {
      title: "First wholesale account",
      detail:
        "Placed in 6 regional stores under a 90-day trial with reorder rights.",
    },
    witness: "The buyer at the retail chain who placed the order.",
    useIt:
      "Use it when applying for inventory financing or pitching a bigger retailer.",
  },
  {
    id: "general-contractor",
    label: "General contractor",
    category: "Small business & trades",
    how: "Every bid asks about completed projects. You seal each job at completion — with the client confirming — so your track record is checkable, not just listed.",
    entry: {
      title: "Completed 4,200 sq ft commercial buildout",
      detail:
        "Delivered two weeks ahead of schedule, $8k under the approved budget.",
    },
    witness: "The property owner or the architect who signed off.",
    useIt: "Attach the link to bid packets and prequalification forms.",
  },
  {
    id: "electrician-plumber",
    label: "Electrician / plumber",
    category: "Small business & trades",
    how: "Licensing renewals, insurance, and big commercial clients all want documented history. You log certifications and major jobs as you complete them.",
    entry: {
      title: "Master electrician license renewed",
      detail: "Completed 24 continuing-education hours; license valid to 2029.",
    },
    witness: "The general contractor you subcontract for most often.",
    useIt: "Send it with quotes for commercial work that requires vetting.",
  },
  {
    id: "landscaper",
    label: "Landscaper / groundskeeper",
    category: "Small business & trades",
    how: "You seal contract wins and completed installations so municipal and commercial bids have verifiable references behind them.",
    entry: {
      title: "Won municipal parks maintenance contract",
      detail: "Two-year contract covering 11 city parks, awarded competitively.",
    },
    witness: "The city procurement officer who awarded the contract.",
    useIt: "Include it in future public-sector bid submissions.",
  },
  {
    id: "salon-owner",
    label: "Salon / barbershop owner",
    category: "Small business & trades",
    how: "You document chair growth, training certifications, and brand partnerships — the history that matters when you franchise, sell, or seek a loan.",
    entry: {
      title: "Grew to 8 chairs, all booked",
      detail:
        "Hired stylists 7 and 8; average utilization above 85% for the quarter.",
    },
    witness: "Your landlord or your product distributor.",
    useIt: "Show it to a buyer or a bank evaluating an expansion loan.",
  },
  {
    id: "food-truck",
    label: "Food truck operator",
    category: "Small business & trades",
    how: "Event organizers and commissaries want proof you're established and reliable. You seal permits, event bookings, and revenue milestones.",
    entry: {
      title: "Booked as a vendor for the state fair",
      detail: "11-day booking, the largest single event on the calendar.",
    },
    witness: "The event organizer who booked you.",
    useIt:
      "Send it when applying to selective festivals or a brick-and-mortar lease.",
  },
  {
    id: "auto-shop",
    label: "Auto repair shop owner",
    category: "Small business & trades",
    how: "You record certifications, fleet contracts, and equipment investments so fleet clients and insurers can verify your shop's standing.",
    entry: {
      title: "Signed fleet maintenance contract",
      detail: "Servicing 40 vehicles for a regional delivery company.",
    },
    witness: "The fleet manager who signed the agreement.",
    useIt: "Use it when bidding on larger fleet or insurer contracts.",
  },

  // ——— Grants, nonprofits & research ———
  {
    id: "grant-applicant",
    label: "Grant applicant",
    category: "Grants, nonprofits & research",
    how: "Reviewers read hundreds of polished essays. You give them something none of the others have: a sealed record with the funder's own confirmation in it.",
    entry: {
      title: "Grant received — $12,000",
      detail:
        "Awarded by the Civic Innovation Fund for the neighborhood mapping pilot.",
    },
    witness: "The program officer who administered the award.",
    useIt: "Paste the link in the next application's supporting-evidence field.",
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
  },
  {
    id: "phd-student",
    label: "PhD student",
    category: "Grants, nonprofits & research",
    how: "You seal each chapter, experiment, and conference acceptance so years of scattered work turn into a dated, defensible record.",
    entry: {
      title: "Paper accepted at NeurIPS",
      detail: "Accepted as a poster; first-author submission.",
    },
    witness: "Your advisor.",
    useIt:
      "Use it for fellowship applications and the academic job market packet.",
  },
  {
    id: "community-organizer",
    label: "Community organizer",
    category: "Grants, nonprofits & research",
    how: "Impact is hard to quantify and easy to dispute. You seal turnout, wins, and coalition milestones with participants confirming them.",
    entry: {
      title: "Petition reached 5,000 signatures",
      detail: "Delivered to the city council ahead of the zoning vote.",
    },
    witness: "A coalition partner or a council staffer who received it.",
    useIt: "Show funders and press a record they can independently check.",
  },
  {
    id: "oss-maintainer",
    label: "Open-source maintainer",
    category: "Grants, nonprofits & research",
    how: "You seal adoption milestones and funding events so sponsorship conversations rest on dated facts instead of a star count screenshot.",
    entry: {
      title: "Adopted by a Fortune 500 in production",
      detail:
        "Confirmed production deployment across their internal build tooling.",
    },
    witness: "The engineering lead at the adopting company.",
    useIt: "Include it in sponsorship and foundation grant applications.",
  },

  // ——— Freelance & creative ———
  {
    id: "freelance-developer",
    label: "Freelance developer",
    category: "Freelance & creative",
    how: "NDAs often stop you from showing the work itself. You seal what you delivered and let the client confirm it, proving the engagement without leaking the code.",
    entry: {
      title: "Delivered payments integration",
      detail:
        "Shipped Stripe billing for a client's SaaS; cut checkout drop-off by 22%.",
    },
    witness: "The client's CTO or product owner.",
    useIt:
      "Send the proof link with proposals when your portfolio is under NDA.",
  },
  {
    id: "freelance-designer",
    label: "Freelance designer",
    category: "Freelance & creative",
    how: "You timestamp concepts before pitching them and seal completed engagements, so authorship and delivery are both on the record.",
    entry: {
      title: "Completed brand identity system",
      detail:
        "Delivered logo, type system, and a 40-page guideline document on schedule.",
    },
    witness: "The client's marketing director.",
    useIt: "Attach it to proposals and use it if authorship is ever contested.",
  },
  {
    id: "freelance-writer",
    label: "Freelance writer",
    category: "Freelance & creative",
    how: "Ghostwritten work never carries your name. You seal the assignment and have the editor confirm it, so uncredited work still counts.",
    entry: {
      title: "Ghostwrote a 6-part executive series",
      detail: "Six long-form pieces published under the CEO's byline.",
    },
    witness: "The editor or the communications lead who commissioned it.",
    useIt: "Show it to future clients who ask what you've actually written.",
  },
  {
    id: "photographer",
    label: "Photographer",
    category: "Freelance & creative",
    how: "You seal a hash of each shoot the day you deliver it, creating dated proof of authorship that stands up if an image is later scraped or disputed.",
    entry: {
      title: "Delivered a national campaign shoot",
      detail: "180 edited frames delivered; 12 selected for outdoor placement.",
    },
    witness: "The art director who commissioned the shoot.",
    useIt: "Use it in licensing negotiations and copyright disputes.",
  },
  {
    id: "videographer",
    label: "Videographer / filmmaker",
    category: "Freelance & creative",
    how: "You seal production milestones and festival acceptances, building a dated record of a project that took years to finish.",
    entry: {
      title: "Documentary accepted at a festival",
      detail: "Selected for competition out of 1,900 submissions.",
    },
    witness: "The festival programmer or your producer.",
    useIt: "Include it in funding applications for the next film.",
  },
  {
    id: "musician",
    label: "Musician",
    category: "Freelance & creative",
    how: "You timestamp compositions before release and seal performance milestones, so both authorship and momentum are documented.",
    entry: {
      title: "Sold out a 400-capacity venue",
      detail: "Headline show sold out 11 days before the date.",
    },
    witness: "The venue booker or your manager.",
    useIt:
      "Send it to labels, booking agents, and arts grant panels who want evidence of draw.",
  },
  {
    id: "visual-artist",
    label: "Visual artist",
    category: "Freelance & creative",
    how: "You seal each work at completion and each exhibition as it opens, giving your practice a provenance trail collectors and juries can check.",
    entry: {
      title: "First solo exhibition opened",
      detail: "14 works shown; 9 sold during the opening weekend.",
    },
    witness: "The gallery director.",
    useIt: "Attach it to residency and arts-council grant applications.",
  },
  {
    id: "architect",
    label: "Architect",
    category: "Freelance & creative",
    how: "You seal design milestones, permit approvals, and completions so project history is dated across multi-year builds.",
    entry: {
      title: "Received planning approval",
      detail: "Mixed-use proposal approved after two rounds of revisions.",
    },
    witness: "The client or the planning consultant.",
    useIt: "Include it in competition entries and qualification submissions.",
  },

  // ——— Students & academics ———
  {
    id: "high-school-student",
    label: "High school student",
    category: "Students & academics",
    how: "Admissions officers can't tell a real project from an essay about one. You seal what you actually built or organized, with a teacher confirming it.",
    entry: {
      title: "Founded the robotics club",
      detail:
        "Grew from 4 to 31 members and placed third at the regional competition.",
    },
    witness: "Your faculty advisor or the competition organizer.",
    useIt:
      "Add the proof link to the additional-information section of your applications.",
  },
  {
    id: "undergraduate",
    label: "Undergraduate student",
    category: "Students & academics",
    how: "You seal research, internships, and side projects as they happen, so grad school and job applications rest on a dated record.",
    entry: {
      title: "Built and shipped a campus app",
      detail: "1,200 monthly active students by the end of the spring term.",
    },
    witness: "A professor or the student-life office.",
    useIt: "Share it with recruiters and graduate admissions committees.",
  },
  {
    id: "scholarship-applicant",
    label: "Scholarship applicant",
    category: "Students & academics",
    how: "Scholarship committees read the same superlatives every year. You give them a sealed record of the work behind yours.",
    entry: {
      title: "Ran a free tutoring program",
      detail: "Tutored 45 students across two semesters, 320 volunteer hours.",
    },
    witness: "The school counselor or the partner organization.",
    useIt: "Include it wherever the application allows a supporting link.",
  },
  {
    id: "competition-entrant",
    label: "Science / hackathon competitor",
    category: "Students & academics",
    how: "You timestamp your build during the event, proving the work was done inside the window rather than prepared in advance.",
    entry: {
      title: "Placed second at a 36-hour hackathon",
      detail: "Built an accessibility tool judged by a panel of six.",
    },
    witness: "A judge or an organizer.",
    useIt: "Attach it to internship applications and future competition entries.",
  },
  {
    id: "bootcamp-grad",
    label: "Bootcamp graduate",
    category: "Students & academics",
    how: "Without a traditional degree you get asked to prove your skills. You seal each project and let instructors and clients confirm them.",
    entry: {
      title: "Shipped a capstone for a real client",
      detail:
        "Built an inventory system now used daily by a 12-person business.",
    },
    witness: "The client using the system.",
    useIt: "Send it with job applications instead of a link-only portfolio.",
  },

  // ——— Professional services ———
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
  },
  {
    id: "coach",
    label: "Business / executive coach",
    category: "Professional services",
    how: "Coaching outcomes are notoriously unverifiable. You seal client milestones — with their permission and confirmation — into a real record.",
    entry: {
      title: "Client closed their Series A",
      detail:
        "Coached the founder through an 8-month process ending in a $4M round.",
    },
    witness: "The client themselves.",
    useIt: "Show prospective clients evidence instead of anonymous testimonials.",
  },
  {
    id: "real-estate-agent",
    label: "Real estate agent",
    category: "Professional services",
    how: "You seal closings and record-setting sales as they happen, so your production history is checkable rather than self-reported.",
    entry: {
      title: "Closed a neighborhood record sale",
      detail: "Sold 18% above the previous high for comparable properties.",
    },
    witness: "The seller or the closing attorney.",
    useIt: "Share it with sellers deciding between agents.",
  },
  {
    id: "accountant",
    label: "Accountant / bookkeeper",
    category: "Professional services",
    how: "You seal certifications and client engagements, and you can act as a witness on your clients' revenue entries — which is often the most credible attestation they can get.",
    entry: {
      title: "Completed CPA continuing education",
      detail: "40 hours completed, including 8 in ethics.",
    },
    witness: "Your professional body or a long-term client.",
    useIt: "Show it to prospective clients evaluating your standing.",
  },
  {
    id: "solo-attorney",
    label: "Solo attorney",
    category: "Professional services",
    how: "You seal case outcomes and bar standing to build a dated practice history for referrals and directory listings.",
    entry: {
      title: "Won summary judgment for a small business client",
      detail: "Contract dispute resolved without trial after a 9-month matter.",
    },
    witness: "The client, where privilege and consent allow.",
    useIt: "Use it in referral conversations and directory profiles.",
  },
  {
    id: "insurance-broker",
    label: "Insurance broker",
    category: "Professional services",
    how: "You seal licensing, carrier appointments, and book-of-business milestones so your standing is documented over time.",
    entry: {
      title: "Appointed by a third carrier",
      detail: "Added commercial lines authority, expanding the product set.",
    },
    witness: "The carrier's regional manager.",
    useIt: "Show it to commercial clients comparing brokers.",
  },

  // ——— Health, wellness & care ———
  {
    id: "therapist",
    label: "Therapist in private practice",
    category: "Health, wellness & care",
    how: "You seal licensure, supervision hours, and specialized training — never client information — so credentials are verifiable at a glance.",
    entry: {
      title: "Completed EMDR certification",
      detail: "Finished 50 supervised hours and the full training sequence.",
    },
    witness: "Your clinical supervisor or the training institute.",
    useIt: "Link it from your practice site and insurance panel applications.",
  },
  {
    id: "personal-trainer",
    label: "Personal trainer",
    category: "Health, wellness & care",
    how: "The industry is full of unverifiable claims. You seal certifications and client outcomes that the clients themselves confirm.",
    entry: {
      title: "Client completed a 12-week program",
      detail:
        "Reached every strength target; results confirmed by the client directly.",
    },
    witness: "The client.",
    useIt: "Show it to prospects who are tired of unverifiable transformations.",
  },
  {
    id: "nutritionist",
    label: "Nutritionist / dietitian",
    category: "Health, wellness & care",
    how: "You seal credentials and program outcomes so clients and referring physicians can confirm your standing independently.",
    entry: {
      title: "Registered dietitian credential renewed",
      detail: "Completed 75 continuing professional education units.",
    },
    witness: "The credentialing body or a referring physician.",
    useIt: "Link it from your practice page and referral packets.",
  },
  {
    id: "doula",
    label: "Doula / midwife",
    category: "Health, wellness & care",
    how: "You seal training, certifications, and births attended — counts only, no client details — so experience is documented for families choosing a provider.",
    entry: {
      title: "Attended 100th birth",
      detail: "Reached 100 cumulative births attended as primary support.",
    },
    witness: "A supervising midwife or the certifying organization.",
    useIt: "Share it with prospective families and hospital privileging boards.",
  },

  // ——— Creators & community ———
  {
    id: "content-creator",
    label: "Content creator",
    category: "Creators & community",
    how: "Screenshots of analytics are trivially faked. You seal audience milestones and brand deals so sponsors get something they can verify.",
    entry: {
      title: "Reached 100k subscribers",
      detail: "Crossed 100,000 on the main channel with 62% watch-through.",
    },
    witness: "Your agency or a brand partner from a past campaign.",
    useIt: "Send it in sponsorship pitches instead of a dashboard screenshot.",
  },
  {
    id: "newsletter-writer",
    label: "Newsletter writer",
    category: "Creators & community",
    how: "You seal subscriber and revenue milestones so advertisers can verify list size without being handed an editable export.",
    entry: {
      title: "Passed 10,000 subscribers",
      detail: "10,240 subscribers at a 48% average open rate.",
    },
    witness: "An advertiser who ran a campaign and saw the results.",
    useIt: "Include it in your media kit.",
  },
  {
    id: "podcaster",
    label: "Podcaster",
    category: "Creators & community",
    how: "You seal download milestones and notable guests, so ad conversations start from verified numbers.",
    entry: {
      title: "Hit 50,000 downloads per episode",
      detail: "30-day average crossed 50k across the last six episodes.",
    },
    witness: "Your host platform rep or a repeat advertiser.",
    useIt: "Attach it to sponsorship rate cards.",
  },
  {
    id: "community-manager",
    label: "Community manager",
    category: "Creators & community",
    how: "Community work is invisible in a résumé. You seal growth and engagement milestones with confirmations from the org you did it for.",
    entry: {
      title: "Grew the community to 20,000 members",
      detail: "Sustained 34% weekly active participation over six months.",
    },
    witness: "The head of marketing or the founder you reported to.",
    useIt: "Use it when moving to a new role where your impact is hard to show.",
  },
  {
    id: "event-organizer",
    label: "Event organizer",
    category: "Creators & community",
    how: "You seal attendance, sponsorships, and speaker lineups so next year's sponsors can verify last year's numbers.",
    entry: {
      title: "Sold out a 600-person conference",
      detail: "600 tickets sold, 14 sponsors, 22 speakers across two days.",
    },
    witness: "The venue manager or the title sponsor.",
    useIt: "Send it in next year's sponsorship prospectus.",
  },

  // ——— Inside a company ———
  {
    id: "product-manager",
    label: "Product manager",
    category: "Inside a company",
    how: "Credit for shipped work gets blurry across teams and reorgs. You seal launches and outcomes as they happen, with colleagues confirming your role.",
    entry: {
      title: "Launched self-serve onboarding",
      detail: "Cut time-to-first-value from 6 days to 40 minutes.",
    },
    witness: "Your engineering lead or your manager.",
    useIt: "Bring it to performance reviews and future interviews.",
  },
  {
    id: "engineering-manager",
    label: "Engineering manager",
    category: "Inside a company",
    how: "You seal team outcomes, migrations, and reliability wins, so your impact survives reorgs and manager turnover.",
    entry: {
      title: "Completed the monolith-to-services migration",
      detail: "Nine months, zero customer-facing downtime.",
    },
    witness: "Your director or the platform team lead.",
    useIt: "Use it in promotion packets and senior-role interviews.",
  },
  {
    id: "sales-rep",
    label: "Sales representative",
    category: "Inside a company",
    how: "Quota attainment claims are unverifiable once you leave a company. You seal them while you're still there, with a manager confirming.",
    entry: {
      title: "Closed the largest deal in company history",
      detail: "$1.2M three-year contract, 240% of annual quota.",
    },
    witness: "Your VP of Sales.",
    useIt: "Show it to hiring managers who've learned to discount résumé numbers.",
  },
  {
    id: "agency-account-manager",
    label: "Agency account manager",
    category: "Inside a company",
    how: "You seal campaign results and retained accounts so client outcomes follow you rather than staying with the agency.",
    entry: {
      title: "Renewed a flagship account for a third year",
      detail: "Retained a $400k annual account after a competitive review.",
    },
    witness: "The client's marketing director.",
    useIt: "Use it when pitching new business or moving agencies.",
  },
  {
    id: "vendor-supplier",
    label: "Vendor / supplier",
    category: "Inside a company",
    how: "Procurement teams demand references and performance history. You seal delivery milestones so prequalification is a link instead of a scramble.",
    entry: {
      title: "18 months of on-time delivery",
      detail: "142 consecutive shipments delivered on schedule and in spec.",
    },
    witness: "The buyer's procurement manager.",
    useIt: "Attach it to RFP responses and supplier prequalification forms.",
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
