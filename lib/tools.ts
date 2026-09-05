export type ToolKind =
  | "verify"
  | "guide"
  | "lab"
  | "review"
  | "log"
  | "lex"
  | "faq"
  | "sec";

export type ToolLink = {
  href: string;
  label: string;
  text: string;
  kind: ToolKind;
  featured?: boolean;
};

export type ToolGroup = {
  heading: string;
  links: ToolLink[];
};

export const TOOL_GROUPS: ToolGroup[] = [
  {
    heading: "Verification tool",
    links: [
      {
        href: "/verify",
        label: "Verify a ledger",
        text: "Paste a public proof URL. The seals recompute in this browser.",
        kind: "verify",
        featured: true,
      },
      {
        href: "/verify-guide",
        label: "Verify it yourself",
        text: "SHA-256 and OpenTimestamps, with no Beleg page in the loop.",
        kind: "guide",
      },
    ],
  },
  {
    heading: "On the chain",
    links: [
      {
        href: "/how-it-works#try",
        label: "Break a chain",
        text: "Edit one character. Watch every seal after it fail.",
        kind: "lab",
      },
      {
        href: "/for-reviewers",
        label: "For reviewers",
        text: "What to ask for, and how to read a public page.",
        kind: "review",
      },
    ],
  },
  {
    heading: "The rest",
    links: [
      {
        href: "/changelog",
        label: "Changelog",
        text: "What shipped, and what broke.",
        kind: "log",
      },
      {
        href: "/glossary",
        label: "Glossary",
        text: "Hash, seal, chain, genesis, anchor.",
        kind: "lex",
      },
      {
        href: "/faq",
        label: "FAQ",
        text: "Edit, shutdown, blockchain, cost.",
        kind: "faq",
      },
      {
        href: "/security",
        label: "Security",
        text: "What the chain defends, and what it does not.",
        kind: "sec",
      },
    ],
  },
];

export const FEATURED_TOOL =
  TOOL_GROUPS.flatMap((group) => group.links).find((tool) => tool.featured) ??
  TOOL_GROUPS[0].links[0];

export const OTHER_TOOLS = TOOL_GROUPS.flatMap((group) =>
  group.links.filter((tool) => !tool.featured),
);
