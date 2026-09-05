import Link from "next/link";

import {
  FEATURED_TOOL,
  OTHER_TOOLS,
  type ToolKind,
  type ToolLink,
} from "@/lib/tools";

function Stage({ kind }: { kind: ToolKind }) {
  if (kind === "verify") {
    return (
      <div className="tool-stage tool-stage-verify" aria-hidden="true">
        <span className="tool-stage-row is-ok">
          <i />
          #07 grant
          <em>OK</em>
        </span>
        <span className="tool-stage-row is-ok">
          <i />
          #08 witness
          <em>OK</em>
        </span>
        <span className="tool-stage-row is-run">
          <i />
          verify
          <em>LOCAL</em>
        </span>
        <span className="tool-stage-bars">
          <b />
          <b />
          <b />
          <b />
          <b />
        </span>
      </div>
    );
  }

  if (kind === "guide") {
    return (
      <div className="tool-stage tool-stage-guide" aria-hidden="true">
        <code>$ sha256sum entry.json</code>
        <code>a3f81c94b7d0e29b</code>
        <code>$ ots verify seal.ots</code>
      </div>
    );
  }

  if (kind === "lab") {
    return (
      <div className="tool-stage tool-stage-lab" aria-hidden="true">
        <span className="tool-stage-row is-ok">
          <i />
          #01
          <em>OK</em>
        </span>
        <span className="tool-stage-row is-break">
          <i />
          #02
          <em>BREAK</em>
        </span>
        <span className="tool-stage-row is-break">
          <i />
          #03
          <em>BREAK</em>
        </span>
      </div>
    );
  }

  if (kind === "review") {
    return (
      <div className="tool-stage tool-stage-review" aria-hidden="true">
        <span />
        <span />
        <span className="is-live" />
      </div>
    );
  }

  return (
    <div className={`tool-stage tool-stage-${kind}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function ToolCard({
  tool,
  featured = false,
}: {
  tool: ToolLink;
  featured?: boolean;
}) {
  return (
    <Link
      href={tool.href}
      className={`tool-card tool-kind-${tool.kind}${featured ? " is-featured" : ""}`}
    >
      {featured ? (
        <div className="tool-card-chrome" aria-hidden="true">
          <span className="tool-card-dots">
            <i />
            <i />
            <i />
          </span>
          <em>beleg.app/verify</em>
        </div>
      ) : null}
      <div className="tool-card-body">
        <div className="tool-card-copy">
          <p className="tool-card-kicker">
            {featured ? "Verification tool" : "Tool"}
          </p>
          <h2>{tool.label}</h2>
          <p>{tool.text}</p>
          <span className="tool-card-go">Open →</span>
        </div>
        <Stage kind={tool.kind} />
      </div>
    </Link>
  );
}

export function ToolsDeck() {
  return (
    <div className="tools-deck">
      <ToolCard tool={FEATURED_TOOL} featured />
      <div className="tools-grid">
        {OTHER_TOOLS.map((tool) => (
          <ToolCard key={`${tool.kind}-${tool.href}`} tool={tool} />
        ))}
      </div>
    </div>
  );
}
