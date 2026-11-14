import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, CalendarDays, RefreshCw } from 'lucide-react';
import { staffRequest } from '../services/staffApi';
import '../styles/website-performance.css';
const format = value => Number(value || 0).toLocaleString('en-KE');
const labels = { '/': 'Homepage', '/rooms': 'Hotel rooms', '/booking': 'Booking', '/private-stays': 'Private stays', '/events-groups': 'Events & groups', '/conferences': 'Conferences' };
const vitalDetails = [['LCP', 'Main content', 'ms', 'Good: ≤ 2,500 ms'], ['INP', 'Interaction response', 'ms', 'Good: ≤ 200 ms'], ['CLS', 'Layout stability', '', 'Good: ≤ 0.1'], ['TTFB', 'First server response', 'ms', 'Good: ≤ 800 ms']];
export default function WebsitePerformance() {
  const [days, setDays] = useState('30'), [revision, setRevision] = useState(0);
  const [state, setState] = useState({ data: null, error: '', loading: true });
  useEffect(() => {
    let active = true;
    staffRequest(`/api/staff/admin/website-analytics/?days=${days}`, { signal: AbortSignal.timeout(15000) }).then(data => { if (active) setState({ data, error: '', loading: false }); }).catch(error => { if (active) setState({ data: null, loading: false, error: error.status === 404 ? 'Website analytics is not available on the backend yet. Deploy the backend and apply its analytics migration.' : 'Website analytics could not be loaded. Please retry.' }); });
    return () => { active = false; };
  }, [days, revision]);
  function refresh() { setState(old => ({ ...old, loading: true })); setRevision(n => n + 1); }
  function changePeriod(event) { setDays(event.target.value); setState({ data: null, error: '', loading: true }); }
  const data = state.data;
  const max = Math.max(1, ...(data?.trend || []).map(day => day.views));
  return <section className="website-performance" aria-labelledby="website-performance-title">
    <header className="performance-heading"><div><span className="eyebrow">YOUR WEBSITE, AT A GLANCE</span><h2 id="website-performance-title">Website performance</h2><p>Understand what guests explore and how the website feels.</p></div><div className="performance-controls"><label>Period<select value={days} onChange={changePeriod}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label><button type="button" onClick={refresh} disabled={state.loading} aria-label="Refresh website analytics"><RefreshCw size={18} /></button></div></header>
    {state.loading && <p role="status">Loading website measurements…</p>}
    {state.error && <div className="performance-state" role="alert"><Activity /><p>{state.error}</p><button type="button" onClick={refresh}>Try again</button></div>}
    {data && !state.loading && <>
      {!data.enabled && <p role="status" className="performance-state">New measurement collection is disabled on the backend. Historical measurements remain available.</p>}
      <div className="performance-kpis">{[[BarChart3, 'Page views', data.page_views, 'Recorded public-page visits'], [ArrowUpRight, 'Booking actions', data.booking_actions, 'Planning and stay-search actions'], [CalendarDays, 'Requests received', data.requests_received, 'Saved requests from the booking system']].map(([Icon, title, value, copy]) => <article key={title}><Icon size={22} /><span>{title}</span><strong>{format(value)}</strong><small>{copy}</small></article>)}</div>
      {!data.page_views && <div className="performance-empty"><Activity size={28} /><h3>No website measurements yet</h3><p>Data begins when guests browse the updated website. We do not estimate visits or populate sample traffic.</p></div>}
      <div className="performance-panels"><section className="performance-panel"><div className="performance-section-title"><h3>Daily interest</h3><span>{data.start} — {data.end}</span></div><div className="performance-chart" role="img" aria-label={`Daily page views: ${data.trend.map(day => `${day.day}: ${day.views}`).join(', ')}`}>{data.trend.map(day => <div className="performance-chart-column" key={day.day} title={`${day.day}: ${day.views} page views, ${day.requests} requests`}><span style={{ height: `${day.views / max * 100}%` }} /></div>)}</div><div className="performance-chart-axis"><span>{data.start}</span><span>Page views · Nairobi time</span><span>{data.end}</span></div><details className="performance-data-table"><summary>View daily numbers</summary><table><thead><tr><th>Date</th><th>Page views</th><th>Requests received</th></tr></thead><tbody>{data.trend.map(day => <tr key={day.day}><th>{day.day}</th><td>{format(day.views)}</td><td>{format(day.requests)}</td></tr>)}</tbody></table></details></section>
      <section className="performance-panel"><h3>Most explored pages</h3>{data.pages.length ? <ol className="performance-pages">{data.pages.slice(0, 8).map(page => <li key={page.path}><span>{labels[page.path] || page.path}<small>{page.path}</small></span><strong>{format(page.views)}</strong></li>)}</ol> : <p>Page popularity will appear once measurements arrive.</p>}</section></div>
      <section className="performance-panel"><div className="performance-section-title"><h3>Real browser experience</h3><span>Diagnostic averages · not a Lighthouse score</span></div><div className="performance-vitals">{vitalDetails.map(([name, title, unit, target]) => { const metric = data.vitals[name]; return <article key={name}><span>{name} · {title}</span><strong>{metric?.average === null || metric?.average === undefined ? '—' : `${name === 'CLS' ? metric.average.toFixed(3) : format(Math.round(metric.average))}${unit ? ` ${unit}` : ''}`}</strong><p>{metric?.samples ? `${format(metric.samples)} samples · ${metric.good_percent}% good samples` : 'No browser samples yet'}</p><small>{target}</small></article>; })}</div><p className="performance-note">These are averages of received document-load measurements, not Google’s 75th-percentile field assessment. Page views include SPA navigation. Traffic measurement starts with this release; past visits are not reconstructed. Counts are not unique visitors; blockers and privacy preferences may reduce collection. Booking requests come from saved server records.</p></section>
      <footer className="performance-note">Aggregate first-party measurements only: no guest details, URL queries, cookies or visitor identifiers are collected by this feature. Updated {new Date(data.updated_at).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}.</footer>
    </>}
  </section>;
}
