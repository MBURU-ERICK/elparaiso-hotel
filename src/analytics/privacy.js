import { canonicalPaths, routeAliases } from '../config/site.js';
const paths = new Set([...canonicalPaths, '/booking']);
export function analyticsPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const normalized = routeAliases[path] || path;
  return paths.has(normalized) ? normalized : null;
}
export function allowsAnalytics(browser) {
  return browser.navigator.doNotTrack !== '1' && browser.navigator.globalPrivacyControl !== true;
}
