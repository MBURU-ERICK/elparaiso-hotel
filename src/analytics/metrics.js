import { analyticsPath, allowsAnalytics } from './privacy';
export { analyticsPath, allowsAnalytics } from './privacy';
const base = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').trim().replace(/\/+$/, '');
export function reportMetric(path, metric, value = 0) {
  if (!path || !analyticsPath(window.location.pathname) || import.meta.env.VITE_WEBSITE_ANALYTICS_ENABLED === 'false' || !allowsAnalytics(window)) return;
  // No credentials, URL queries, referrer, guest details or persistent identifiers.
  fetch(`${base}/api/website-metrics/`, { method: 'POST', credentials: 'omit', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ path, metric, value: Math.max(0, Number(value.toFixed(5))) }) }).catch(() => {});
}
