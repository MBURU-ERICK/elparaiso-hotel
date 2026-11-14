import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsPath, allowsAnalytics, reportMetric } from './metrics';
let lastLocation = null;
let vitalsStarted = false;
export default function WebsiteTracker() {
  const location = useLocation();
  useEffect(() => {
    if (import.meta.env.VITE_WEBSITE_ANALYTICS_ENABLED === 'false' || !allowsAnalytics(window)) return;
    const path = analyticsPath(location.pathname);
    if (path && lastLocation !== location.key) reportMetric(path, 'page_view');
    lastLocation = location.key;
    const booking = event => {
      if (event.detail?.event === 'booking-start' && path) reportMetric(path, 'booking_start');
    };
    window.addEventListener('hotel:analytics', booking);
    if (!vitalsStarted) {
      vitalsStarted = true;
      if (path) import('web-vitals').then(({ onCLS, onLCP, onINP, onTTFB }) => {
        const sent = new Set();
        const send = metric => {
          const key = `${metric.name}:${metric.id}`;
          if (sent.has(key)) return;
          sent.add(key);
          reportMetric(path, metric.name, metric.value);
        };
        onCLS(send); onLCP(send); onINP(send); onTTFB(send);
      }).catch(() => {});
    }
    return () => window.removeEventListener('hotel:analytics', booking);
  }, [location.key, location.pathname]);
  return null;
}
