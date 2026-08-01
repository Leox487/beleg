export default function Loading() {
  return (
    <main className="page">
      <div className="page-inner ledger">
        <header className="ledger-header">
          <span className="skel skel-title" />
          <span className="skel skel-line skel-w-40" />
        </header>

        <div className="chain">
          {[0, 1, 2].map((i) => (
            <div key={i} className="entry-card skel-card">
              <span className="skel skel-line skel-w-20" />
              <span className="skel skel-line skel-w-70" />
              <span className="skel skel-line skel-w-90" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
