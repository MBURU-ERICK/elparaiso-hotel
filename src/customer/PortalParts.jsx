export function PortalState({ loading, error, retry, empty }) {
  if (loading) return <p role="status" className="portal-state">Loading your details…</p>;
  if (error) return <div role="alert" className="portal-alert"><p>{error}</p><button onClick={retry}>Try again</button></div>;
  return empty ? <p className="portal-empty">Nothing here yet. Your requests and updates will appear here.</p> : null;
}
export function PortalPages({ page, count, setPage }) {
  if (count <= 20 && page === 1) return null;
  return <nav className="gallery-pagination" aria-label="Result pages"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}</span><button disabled={page * 20 >= count} onClick={() => setPage(page + 1)}>Next</button></nav>;
}
export function Badge({ children }) { return <span className="portal-badge">{String(children).replaceAll('_', ' ')}</span>; }
