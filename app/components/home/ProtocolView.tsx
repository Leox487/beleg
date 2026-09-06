"use client";

const LINKS = [
  {
    n: "01",
    event: "Grant received",
    hash: "a3f81c94b7d0e29b",
    prev: "—",
  },
  {
    n: "02",
    event: "Confirmation",
    hash: "7b02e9f3314fc118",
    prev: "a3f81c94b7d0e29b",
  },
  {
    n: "03",
    event: "Pilot launched",
    hash: "c14d6a2e8099e07f",
    prev: "7b02e9f3314fc118",
  },
];

export function ProtocolView() {
  return (
    <section id="protocol" className="bh-proto">
      <p className="bh-kicker">The protocol</p>
      <h2 className="bh-display">Built so the history stays visible.</h2>
      <ol className="bh-proto-list">
        {LINKS.map((link, i) => (
          <li key={link.n}>
            <p>
              Record {link.n}
              <span>{link.event}</span>
            </p>
            <dl>
              <div>
                <dt>Hash</dt>
                <dd>{link.hash}</dd>
              </div>
              <div>
                <dt>Previous</dt>
                <dd>{link.prev}</dd>
              </div>
            </dl>
            {i < LINKS.length - 1 ? <b aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
