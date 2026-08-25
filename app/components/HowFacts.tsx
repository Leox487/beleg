const FACTS = [
  {
    id: "record",
    n: "01",
    title: "Record",
    text: "Each entry is hashed and linked to the one before it. There is no edit button.",
  },
  {
    id: "witness",
    n: "02",
    title: "Witness",
    text: "Someone who was there confirms in one click. They do not need an account.",
  },
  {
    id: "verify",
    n: "03",
    title: "Verify",
    text: "The public page recomputes every seal in the reviewer’s browser.",
  },
  {
    id: "timestamp",
    n: "04",
    title: "Timestamp",
    text: "The newest seal is dated on Bitcoin with OpenTimestamps.",
  },
] as const;

export function HowFacts() {
  return (
    <div className="how-split">
      <ol className="how-facts">
        {FACTS.map((fact) => (
          <li key={fact.id} className="ip-anchor" id={fact.id}>
            <p className="how-fact-n">{fact.n}</p>
            <h2>{fact.title}</h2>
            <p>{fact.text}</p>
          </li>
        ))}
      </ol>

      <div className="how-play" aria-hidden="true">
        <p className="how-play-kicker">Verify, locally</p>
        <div className="how-play-rows">
          <div className="how-play-row is-ok">
            <i />
            <span>#01 Grant received</span>
            <em>OK</em>
          </div>
          <div className="how-play-row is-ok">
            <i />
            <span>#02 Maya Chen confirmed</span>
            <em>OK</em>
          </div>
          <div className="how-play-row is-break">
            <i />
            <span>#03 Pilot launched</span>
            <em>BREAK</em>
          </div>
        </div>
        <button type="button" className="how-play-btn" tabIndex={-1}>
          Run Verify
        </button>
        <span className="how-play-cursor" />
      </div>
    </div>
  );
}
