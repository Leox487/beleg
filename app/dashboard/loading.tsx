/**
 * Prefetched by Next, so clicking through to the dashboard swaps to this
 * immediately instead of sitting on the previous page while auth and the
 * Supabase queries resolve.
 */
export default function Loading() {
  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-header">
          <span className="skel skel-title" />
        </header>

        <div className="card-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="venture-card skel-card">
              <span className="skel skel-line skel-w-60" />
              <span className="skel skel-line skel-w-80" />
              <span className="skel skel-line skel-w-40" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
