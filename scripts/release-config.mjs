export function validateProductionApiOrigin(value) {
  if (!value?.trim()) throw new Error('Production builds require VITE_API_URL. Use the public HTTPS API origin; see .env.example.');
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('VITE_API_URL must be an absolute HTTPS origin.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !['', '/'].includes(url.pathname) || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('VITE_API_URL must be a public HTTPS origin without credentials, path, query or fragment.');
  }
  return url.origin;
}
